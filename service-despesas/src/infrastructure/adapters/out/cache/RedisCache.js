class RedisCache {
  /**
   * @param {Object} redisClient - Cliente do Redis já conectado (ex: pacote 'redis' ou 'ioredis')
   */
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async set(chave, valor, tempoExpiracaoSegundos = 3600) {
    const valorString = JSON.stringify(valor);
    await this.redis.set(chave, valorString, 'EX', tempoExpiracaoSegundos);
  }

  async get(chave) {
    const valorString = await this.redis.get(chave);
    if (!valorString) return null;
    return JSON.parse(valorString);
  }

  async del(chave) {
    await this.redis.del(chave);
  }

  // Útil para limpar caches em lote (ex: invalidar cache do dashboard de um usuário específico)
  async delPrefix(prefixo) {
    const keys = await this.redis.keys(`${prefixo}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export { RedisCache };
export default RedisCache;