/**
 * Requisito 3 (Compensação / SAGA): estorna despesas registradas quando o
 * evento que as originou é cancelado, ou quando a viagem é removida.
 *
 * Idempotente: estornar uma despesa já estornada não é tratado como erro,
 * só é ignorada — importante porque uma saga pode reenviar a compensação.
 */
class CompensarDespesaCommand {
  constructor(despesaRepository) {
    this.despesaRepository = despesaRepository;
  }

  async executar({ eventoId, viagemId } = {}) {
    if (!eventoId && !viagemId) {
      throw new Error('Informe eventoId ou viagemId para compensar despesas.');
    }

    const despesas = eventoId
      ? await this.despesaRepository.buscarPorEventoId(eventoId)
      : await this.despesaRepository.buscarPorViagemId(viagemId);

    const estornadas = [];
    const jaEstornadas = [];

    for (const despesa of despesas) {
      if (!despesa.estaAtiva()) {
        jaEstornadas.push(despesa.id);
        continue;
      }

      despesa.estornar();
      await this.despesaRepository.salvar(despesa);
      estornadas.push(despesa.id);
    }

    return {
      encontradas: despesas.length,
      estornadas,
      jaEstornadas,
    };
  }
}

export { CompensarDespesaCommand };
export default CompensarDespesaCommand;
