import crypto from 'crypto';
import Saga from '../../domain/entities/Saga.js';

/*
 * Dispara a compensação de uma despesa (ou de um grupo de despesas com o
 * mesmo eventoId), via cmd_cancelar_despesa/resposta_cancelar_despesa —
 * já implementado do lado de service-despesas (CompensarDespesasCommandHandler).
 *
 * Se a despesa original tinha gruId (o `eventoId` recebido aqui é o mesmo
 * sagaId gerado por RegistrarDespesaSaga, então dá pra recuperar o payload
 * original via sagaRepository), também desfaz o vínculo com o grupo
 * (cmd_desvincular_despesa_grupo) para cada despesa estornada. Esse passo é
 * best-effort: a despesa já foi estornada nesse ponto, então uma falha aqui
 * não derruba a saga — só fica registrada nos passos.
 */
export class CancelarDespesaSaga {
  constructor(rpcClient, sagaRepository) {
    this.rpcClient = rpcClient;
    this.sagaRepository = sagaRepository;
  }

  async execute({ eventoId }) {
    const sagaId = crypto.randomUUID();
    const saga = new Saga({ id: sagaId, tipo: 'CANCELAR_DESPESA', payload: { eventoId } });

    try {
      const resposta = await this.rpcClient.requisitar(
        'cmd_cancelar_despesa',
        'resposta_cancelar_despesa',
        { eventoId },
        { correlationId: sagaId }
      );
      saga.registrarPasso('CANCELAR_DESPESA', resposta.status, resposta);

      if (resposta.status === 'SUCESSO') {
        await this.desvincularDoGrupo(eventoId, resposta, saga);
        saga.concluir(resposta);
      } else {
        saga.falhar(resposta);
      }
    } catch (erro) {
      saga.registrarPasso('CANCELAR_DESPESA', 'ERRO', { mensagem: erro.message });
      saga.falhar({ motivo: 'ERRO_COMUNICACAO', mensagem: erro.message });
    }

    return this.sagaRepository.salvar(saga);
  }

  async desvincularDoGrupo(eventoId, respostaCancelamento, saga) {
    const estornadas = respostaCancelamento.estornadas ?? [];
    if (estornadas.length === 0) return;

    let sagaOriginal = null;
    if (typeof this.sagaRepository.buscarPorId === 'function') {
      try {
        sagaOriginal = await this.sagaRepository.buscarPorId(eventoId);
      } catch {
        sagaOriginal = null;
      }
    }

    const gruId = sagaOriginal?.sag_payload?.gruId ?? sagaOriginal?.payload?.gruId;
    if (!gruId) return;

    for (const desId of estornadas) {
      try {
        const resposta = await this.rpcClient.requisitar(
          'cmd_desvincular_despesa_grupo',
          'resposta_desvincular_despesa_grupo',
          { gru_id: gruId, des_id: desId },
          { correlationId: crypto.randomUUID() }
        );
        saga.registrarPasso('DESVINCULAR_DESPESA_GRUPO', resposta.status, resposta);
      } catch (erro) {
        saga.registrarPasso('DESVINCULAR_DESPESA_GRUPO', 'ERRO', { mensagem: erro.message, des_id: desId });
      }
    }
  }
}

export default CancelarDespesaSaga;
