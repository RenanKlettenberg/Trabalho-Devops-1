class ExchangeRateApiAdapter {
  constructor(baseUrl = process.env.EXCHANGE_API_URL || 'https://api.exchangerate-api.com/v4/latest') {
    this.baseUrl = baseUrl;
  }

  async obterTaxa(moedaOrigem, moedaDestino) {
    const response = await fetch(`${this.baseUrl}/${moedaOrigem}`);
    if (!response.ok) throw new Error(`API de câmbio retornou ${response.status}`);

    const data = await response.json();
    const taxa = data.rates?.[moedaDestino];
    if (typeof taxa !== 'number') {
      throw new Error(`Taxa não encontrada para ${moedaOrigem}/${moedaDestino}`);
    }
    return taxa;
  }
}

export { ExchangeRateApiAdapter };
export default ExchangeRateApiAdapter;
