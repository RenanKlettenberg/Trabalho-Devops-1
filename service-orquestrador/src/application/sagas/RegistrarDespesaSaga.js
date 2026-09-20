import crypto from 'crypto';
import Saga from '../../domain/entities/Saga.js';

/*
 * Orquestra o registro de uma despesa. Hoje o único participante real da
 * saga é service-despesas (cmd_registrar_despesa/resposta_registrar_despesa).
 *
 * A saga é definida como uma lista de passos justamente para ser extensível:
 * para adicionar uma validação em outro serviço (ex: confirmar que a viagem
 * existe antes de registrar a despesa), basta acrescentar um novo item na
 * lista devolvida por `passos()`, apontando para a fila cmd_/resposta_ desse
 * serviço. Veja ExemploSaga/README.md para o passo a passo completo.
 */
export class RegistrarDespesaSaga {
  constructor(rpcClient, sagaRepository) {
    this.rpcClient = rpcClient;
    this.sagaRepository = sagaRepository;
  }

  passos() {
    return [
      {
        nome: 'REGISTRAR_DESPESA',
        filaComando: 'cmd_registrar_despesa',
        filaResposta: 'resposta_registrar_despesa',
        montarPayload: (dados, sagaId) => ({
          descricao: dados.descricao,
          valor: dados.valor,
          moeda: dados.moeda,
          categoria: dados.categoria,
          viagemId: dados.viagemId,
          eventoId: sagaId,
        }),
      },
    ];
  }

  async execute(dados) {
    const sagaId = crypto.randomUUID();
    const saga = new Saga({ id: sagaId, tipo: 'REGISTRAR_DESPESA', payload: dados });

    for (const passo of this.passos()) {
      try {
        const resposta = await this.rpcClient.requisitar(
          passo.filaComando,
          passo.filaResposta,
          passo.montarPayload(dados, sagaId),
          { correlationId: sagaId }
        );
        saga.registrarPasso(passo.nome, resposta.status, resposta);

        if (resposta.status !== 'SUCESSO') {
          saga.falhar(resposta);
          return this.sagaRepository.salvar(saga);
        }
      } catch (erro) {
        saga.registrarPasso(passo.nome, 'ERRO', { mensagem: erro.message });
        saga.falhar({ motivo: 'ERRO_COMUNICACAO', passo: passo.nome, mensagem: erro.message });
        return this.sagaRepository.salvar(saga);
      }
    }

    const ultimoPasso = saga.passos[saga.passos.length - 1];
    saga.concluir(ultimoPasso.detalhe);
    return this.sagaRepository.salvar(saga);
  }
}

export default RegistrarDespesaSaga;
