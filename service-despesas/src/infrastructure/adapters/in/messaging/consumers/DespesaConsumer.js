import responderComandos from '../RabbitMQRpcResponder.js';
import * as despesaDto from '../../../../../application/dtos/Despesa.dto.js';

const FILA_COMANDO = 'cmd_registrar_despesa';

/**
 * Requisito 1 (via SAGA): recebe cmd_registrar_despesa do
 * service-orquestrador e responde em resposta_registrar_despesa.
 */
class DespesaConsumer {
  constructor(channel, registrarDespesaCommand) {
    this.channel = channel;
    this.registrarDespesaCommand = registrarDespesaCommand;
  }

  async iniciar() {
    await responderComandos(this.channel, FILA_COMANDO, async (payload) => {
      const despesa = await this.registrarDespesaCommand.executar(payload);
      return { status: 'SUCESSO', despesa: despesaDto.paraResposta(despesa) };
    });

    console.log(`[DespesaConsumer] Ouvindo fila "${FILA_COMANDO}".`);
  }
}

export { DespesaConsumer };
export default DespesaConsumer;
