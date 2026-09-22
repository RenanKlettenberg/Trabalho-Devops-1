/**
 * Port (interface) para obtenção de taxas de câmbio.
 * Implementação concreta em infrastructure/adapters/out/external.
 */
class ExchangeRateProvider {
  /**
   * @returns {Promise<number>} taxa para converter 1 unidade de moedaOrigem em moedaDestino
   */
  async obterTaxa(_moedaOrigem, _moedaDestino) {
    throw new Error('ExchangeRateProvider.obterTaxa não implementado');
  }
}

export { ExchangeRateProvider };
export default ExchangeRateProvider;
