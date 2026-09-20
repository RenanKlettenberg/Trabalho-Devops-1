import { jest } from '@jest/globals';
import { ExchangeRateApiAdapter } from '../../../src/infrastructure/adapters/out/external/exchange-api/ExchangeRateApiAdapter.js';

describe('Integração: ExchangeRateApiAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new ExchangeRateApiAdapter();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve retornar a taxa de conversão correta ao consultar a API externa', async () => {
    const taxa = await adapter.obterTaxa('USD', 'BRL');

    expect(typeof taxa).toBe('number');
    expect(taxa).toBeGreaterThan(0); // Garante que retornou um valor plausível
  });

  it('deve lançar erro se a API externa estiver fora do ar (timeout ou 500)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 });

    await expect(adapter.obterTaxa('USD', 'BRL')).rejects.toThrow();
  });

  it('deve lançar erro quando a moeda de destino não vem na resposta da API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.9 } }) // sem BRL
    });

    await expect(adapter.obterTaxa('USD', 'BRL')).rejects.toThrow('Taxa não encontrada para USD/BRL');
  });
});
