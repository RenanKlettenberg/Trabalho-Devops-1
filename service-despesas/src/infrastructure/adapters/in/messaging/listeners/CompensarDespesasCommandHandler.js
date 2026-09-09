import CompensarDespesaCanceladaCommand from '../../../../application/commands/CompensarDespesaCancelada/CompensarDespesaCanceladaCommand.js';

export class CompensarDespesasCommandHandler {
  constructor(repository, publisher) {
    this.command = new CompensarDespesaCanceladaCommand(repository);
    this.publisher = publisher;
  }

  async processarComando(message) {
    const payload = JSON.parse(message.content.toString());
    await this.command.execute(payload);

    const resposta = {
      sagaId: message.properties.correlationId,
      status: 'SUCESSO',
      evento: 'DESPESAS_COMPENSADAS'
    };

    await this.publisher.publicar(
      message.properties.replyTo || 'resposta_cancelar_despesa',
      resposta
    );

    return resposta;
  }
}

export default CompensarDespesasCommandHandler;
