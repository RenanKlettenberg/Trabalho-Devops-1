class AtualizadorTaxasCambio {
  constructor(apiAdapter, cacheAdapter) {
    this.apiAdapter = apiAdapter;
    this.cacheAdapter = cacheAdapter;
  }

  async executar() {
    const taxa = await this.apiAdapter.obterTaxa('USD', 'BRL');
    await this.cacheAdapter.salvar('taxa:USD:BRL', taxa, 3600);
    return taxa;
  }
}

export { AtualizadorTaxasCambio };
export default AtualizadorTaxasCambio;
