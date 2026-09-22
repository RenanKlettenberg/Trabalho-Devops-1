/**
 * Port (interface) de cache. Implementação concreta em
 * infrastructure/adapters/out/cache.
 */
class CacheProvider {
  async obter(_chave) {
    throw new Error('CacheProvider.obter não implementado');
  }

  async definir(_chave, _valor, _ttlSegundos) {
    throw new Error('CacheProvider.definir não implementado');
  }
}

export { CacheProvider };
export default CacheProvider;
