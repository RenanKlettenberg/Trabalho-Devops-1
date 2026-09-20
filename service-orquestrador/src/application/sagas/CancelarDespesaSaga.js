import crypto from 'crypto';
import Saga from '../../domain/entities/Saga.js';

/*
 * Dispara a compensação de uma despesa (ou de um grupo de despesas com o
 * mesmo eventoId), via cmd_cancelar_despesa/resposta_cancelar_despesa —
 * já implementado do lado de service-despesas (CompensarDespesasCommandHandler).
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
}

export default CancelarDespesaSaga;
