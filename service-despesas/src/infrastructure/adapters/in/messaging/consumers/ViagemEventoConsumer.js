import responderComandos from '../RabbitMQRpcResponder.js';
import * as despesaDto from '../../../../../application/dtos/Despesa.dto.js';

const FILA_COMANDO = 'service_viagem/despesa';
const MOEDA_PADRAO = 'BRL';

/**
 * Consome os eventos de viagem com orçamento publicados por service-viagens
 * (src/infrastructure/messaging/despesa.client.js) e registra a despesa
 * correspondente. Mensagem fire-and-forget: sem replyTo, sem resposta esperada.
 * service-viagens não tem conceito de moeda, então usamos MOEDA_PADRAO.
 */
class ViagemEventoConsumer {
  constructor(channel, registrarDespesaCommand) {
    this.channel = channel;
    this.registrarDespesaCommand = registrarDespesaCommand;
  }

  async iniciar() {
    await responderComandos(this.channel, FILA_COMANDO, async (payload) => {
      const despesa = await this.registrarDespesaCommand.executar({
        descricao: payload.descricao,
        valor: payload.valor,
        moeda: payload.moeda ?? MOEDA_PADRAO,
        categoria: payload.categoria,
        viagemId: payload.viagemId,
        eventoId: payload.eventoId,
      });

      return { status: 'SUCESSO', despesa: despesaDto.paraResposta(despesa) };
    });

    console.log(`[ViagemEventoConsumer] Ouvindo fila "${FILA_COMANDO}".`);
  }
}

export { ViagemEventoConsumer };
export default ViagemEventoConsumer;
