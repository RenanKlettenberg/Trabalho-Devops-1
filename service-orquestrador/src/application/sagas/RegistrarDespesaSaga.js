import crypto from 'crypto';
import Saga from '../../domain/entities/Saga.js';

/*
 * Orquestra o registro de uma despesa. Participantes da saga:
 *   - service-despesas (cmd_registrar_despesa/resposta_registrar_despesa)
 *   - service-grupos, só quando a despesa é compartilhada (dados.gruId):
 *     valida o grupo antes (cmd_validar_grupo) e vincula a despesa aos
 *     participantes depois de registrada (cmd_vincular_despesa_grupo).
 *
 * A saga é definida como uma lista de passos justamente para ser extensível:
 * para adicionar uma validação em outro serviço, basta acrescentar um novo
 * item na lista devolvida por `passos()`, apontando para a fila cmd_/resposta_
 * desse serviço. Veja ExemploSaga/README.md para o passo a passo completo.
 */
export class RegistrarDespesaSaga {
  constructor(rpcClient, sagaRepository) {
    this.rpcClient = rpcClient;
    this.sagaRepository = sagaRepository;
  }

  passos() {
    return [
      /*
        Passo de validação (opcional): só entra na saga se a despesa vier
        associada a um grupo (dados.gruId). Uma despesa pessoal, sem grupo,
        não precisa e não deve passar por aqui — daí o `quando`.
        Contrato e convenção de nomes em ExemploSaga/README.md.
      */
      {
        nome: 'VALIDAR_GRUPO',
        filaComando: 'cmd_validar_grupo',
        filaResposta: 'resposta_validar_grupo',
        quando: (dados) => Boolean(dados.gruId),
        montarPayload: (dados) => ({ gruId: dados.gruId }),
      },
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
      /*
        Passo final (opcional): só entra na saga se a despesa for
        compartilhada (dados.gruId). Roda depois de REGISTRAR_DESPESA porque
        precisa do des_id que acabou de ser gerado. Sem lista explícita de
        participantes, service-grupos rateia entre todos os não-isentos.
      */
      {
        nome: 'VINCULAR_DESPESA_GRUPO',
        filaComando: 'cmd_vincular_despesa_grupo',
        filaResposta: 'resposta_vincular_despesa_grupo',
        quando: (dados) => Boolean(dados.gruId),
        montarPayload: (dados, sagaId, resultados) => ({
          gru_id: dados.gruId,
          des_id: resultados.REGISTRAR_DESPESA?.despesa?.id,
          valor: dados.valor,
        }),
      },
    ];
  }

  async execute(dados) {
    const sagaId = crypto.randomUUID();
    const saga = new Saga({ id: sagaId, tipo: 'REGISTRAR_DESPESA', payload: dados });

    const passosAplicaveis = this.passos().filter((passo) => !passo.quando || passo.quando(dados));
    const resultados = {};

    for (const passo of passosAplicaveis) {
      try {
        const resposta = await this.rpcClient.requisitar(
          passo.filaComando,
          passo.filaResposta,
          passo.montarPayload(dados, sagaId, resultados),
          { correlationId: sagaId }
        );
        saga.registrarPasso(passo.nome, resposta.status, resposta);
        resultados[passo.nome] = resposta;

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
