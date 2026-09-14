class ExchangeApiClient {
  constructor() {
    // Usando uma API pública real como exemplo (ExchangeRate-API)
    this.baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  }

  async obterTaxaCambio(moedaOrigem, moedaDestino) {
    try {
      // Faz a chamada REAL para a API externa na internet
      const response = await fetch(`${this.baseUrl}/${moedaOrigem}`);
      
      if (!response.ok) {
        throw new Error(`A API externa retornou um erro: ${response.status}`);
      }

      const data = await response.json();

      // Verifica se a moeda de destino existe na resposta da API
      if (!data.rates || !data.rates[moedaDestino]) {
        throw new Error(`Taxa de câmbio não encontrada para ${moedaOrigem} -> ${moedaDestino}`);
      }

      // Retorna apenas o valor que importa para o seu Domínio (ex: 5.45)
      return data.rates[moedaDestino];

    } catch (error) {
      console.error(`[Exchange API] Falha na integração: ${error.message}`);
      
      // Lança um erro genérico para não vazar detalhes da API externa para a sua aplicação
      throw new Error('Serviço de câmbio indisponível no momento.');
    }
  }
}

export { ExchangeApiClient };
export default ExchangeApiClient;