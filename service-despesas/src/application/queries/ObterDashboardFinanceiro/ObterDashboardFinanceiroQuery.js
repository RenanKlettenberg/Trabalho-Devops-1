export class ObterDashboardFinanceiroQuery {
  constructor(despesaRepository, cambioRepository) {
    this.despesaRepository = despesaRepository;
    this.cambioRepository = cambioRepository;
  }

  async execute({ viagemId, moedaDestino }) {
    const despesas = await this.despesaRepository.buscarPorViagem(viagemId);
    let total = 0;

    for (const despesa of despesas) {
      const moedaOrigem = despesa.moedaOriginal || despesa.moeda;
      const taxa = moedaOrigem === moedaDestino
        ? 1
        : await this.cambioRepository.obterTaxa(moedaOrigem, moedaDestino);
      total += despesa.valor * taxa;
    }

    return { total };
  }
}

export default ObterDashboardFinanceiroQuery;
