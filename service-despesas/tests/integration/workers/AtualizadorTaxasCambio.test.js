import { AtualizadorTaxasCambio } from '../../../src/workers/AtualizadorTaxasCambio.js';
import { ExchangeRateApiAdapter } from '../../../src/infrastructure/adapters/out/external/exchange-api/ExchangeRateApiAdapter.js';
import { RedisCacheAdapter } from '../../../src/infrastructure/adapters/out/cache/redis/RedisCacheAdapter.js';

describe('Integração: Worker - AtualizadorTaxasCambio', () => {
  let worker;
  let apiAdapter;
  let cacheAdapter;

  beforeAll(async () => {
    // Instanciamos os adaptadores reais
    apiAdapter = new ExchangeRateApiAdapter();
    cacheAdapter = new RedisCacheAdapter();
    
    await cacheAdapter.conectar();
    
    // Injetamos as dependências no worker
    worker = new AtualizadorTaxasCambio(apiAdapter, cacheAdapter);
  });

  afterAll(async () => {
    await cacheAdapter.desconectar();
  });

  it('deve buscar as taxas na API externa e salvá-las no cache do Redis', async () => {
    // 1. Executa a tarefa do cronjob manualmente
    await worker.executar();

    // 2. Busca a taxa diretamente no Redis para validar a gravação
    const taxaDolarNoCache = await cacheAdapter.buscar('taxa:USD:BRL');
    
    expect(taxaDolarNoCache).toBeDefined();
    expect(typeof taxaDolarNoCache).toBe('number');
    expect(taxaDolarNoCache).toBeGreaterThan(0);
  });
});