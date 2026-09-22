import ExchangeRateProvider from '../../../../application/ports/ExchangeRateProvider.js';

const TTL_CACHE_SEGUNDOS = 6 * 60 * 60; // taxas de câmbio não mudam a cada minuto

class ExchangeRateApiAdapter extends ExchangeRateProvider {
  constructor(cacheProvider, baseUrl = process.env.EXCHANGE_API_URL) {
    super();
    this.cacheProvider = cacheProvider;
    this.baseUrl = baseUrl;
  }

  async #obterTabelaDeTaxas(moedaOrigem) {
    const chaveCache = `cambio:${moedaOrigem}`;
    const emCache = await this.cacheProvider.obter(chaveCache);
    if (emCache) return emCache;

    const resposta = await fetch(`${this.baseUrl}/${moedaOrigem}`);
    if (!resposta.ok) {
      throw new Error(`Falha ao consultar taxas de câmbio para ${moedaOrigem}: HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();
    const taxas = dados.rates;

    await this.cacheProvider.definir(chaveCache, taxas, TTL_CACHE_SEGUNDOS);
    return taxas;
  }

  async obterTaxa(moedaOrigem, moedaDestino) {
    if (moedaOrigem === moedaDestino) return 1;

    const taxas = await this.#obterTabelaDeTaxas(moedaOrigem);
    const taxa = taxas[moedaDestino];

    if (!taxa) {
      throw new Error(`Taxa de câmbio não disponível para ${moedaOrigem} -> ${moedaDestino}.`);
    }

    return taxa;
  }
}

export { ExchangeRateApiAdapter };
export default ExchangeRateApiAdapter;
