export class CompensarDespesaCanceladaCommand {
  constructor(repository) {
    this.repository = repository;
  }

  async execute({ eventoId }) {
    const despesas = await this.repository.buscarPorEventoId(eventoId);

    for (const despesa of despesas) {
      despesa.cancelar();
    }

    if (despesas.length > 0) {
      await this.repository.atualizarEmLote(despesas);
    }

    return despesas;
  }
}

export default CompensarDespesaCanceladaCommand;
