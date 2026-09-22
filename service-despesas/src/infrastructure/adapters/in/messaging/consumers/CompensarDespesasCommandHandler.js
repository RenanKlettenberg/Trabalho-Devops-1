import responderComandos from '../RabbitMQRpcResponder.js';

const FILA_COMANDO = 'cmd_cancelar_despesa';

/**
 * Requisito 3 (SAGA / compensação): recebe cmd_cancelar_despesa do
 * service-orquestrador quando um evento é cancelado (ou a viagem é
 * removida) e estorna as despesas associadas, respondendo em
 * resposta_cancelar_despesa.
 */
class CompensarDespesasCommandHandler {
  constructor(channel, compensarDespesaCommand) {
    this.channel = channel;
    this.compensarDespesaCommand = compensarDespesaCommand;
  }

  async iniciar() {
    await responderComandos(this.channel, FILA_COMANDO, async (payload) => {
      const resultado = await this.compensarDespesaCommand.executar(payload);
      return { status: 'SUCESSO', ...resultado };
    });

    console.log(`[CompensarDespesasCommandHandler] Ouvindo fila "${FILA_COMANDO}".`);
  }
}

export { CompensarDespesasCommandHandler };
export default CompensarDespesasCommandHandler;
