import { RedisCacheAdapter } from '../../../src/infrastructure/adapters/out/cache/redis/RedisCacheAdapter.js';

describe('Integração: RedisCacheAdapter', () => {
  let cacheAdapter;

  beforeAll(async () => {
    // Inicializa conexão com o Redis de teste
    cacheAdapter = new RedisCacheAdapter();
    await cacheAdapter.conectar();
  });

  afterAll(async () => {
    await cacheAdapter.desconectar();
  });

  it('deve gravar e recuperar um valor do cache com sucesso', async () => {
    const chave = 'taxa:USD:BRL';
    const valor = 5.15;

    await cacheAdapter.salvar(chave, valor, 3600); // Salva com TTL de 1 hora
    const valorRecuperado = await cacheAdapter.buscar(chave);

    expect(valorRecuperado).toBe(valor);
  });

  it('deve retornar null se a chave não existir no cache', async () => {
    const valor = await cacheAdapter.buscar('chave_inexistente');
    expect(valor).toBeNull();
  });
});