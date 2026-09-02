import { ExchangeRateApiAdapter } from '../../../src/infrastructure/adapters/out/external/exchange-api/ExchangeRateApiAdapter.js';
// import nock from 'nock'; // Recomendado para interceptar a chamada HTTP real

describe('Integração: ExchangeRateApiAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new ExchangeRateApiAdapter();
  });

  it('deve retornar a taxa de conversão correta ao consultar a API externa', async () => {
    // Exemplo usando nock (opcional, mas recomendado):
    // nock('https://api.exchangerate.host').get('/convert?from=USD&to=BRL').reply(200, { result: 5.20 });

    const taxa = await adapter.obterTaxa('USD', 'BRL');

    expect(typeof taxa).toBe('number');
    expect(taxa).toBeGreaterThan(0); // Garante que retornou um valor plausível
  });

  it('deve lançar erro se a API externa estiver fora do ar (timeout ou 500)', async () => {
    // nock('https://api.exchangerate.host').get('/convert?from=USD&to=BRL').replyWithError('Network Error');

    await expect(adapter.obterTaxa('USD', 'BRL')).rejects.toThrow();
  });
});