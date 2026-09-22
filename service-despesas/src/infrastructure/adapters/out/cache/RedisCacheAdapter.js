import { createClient } from 'redis';
import CacheProvider from '../../../../application/ports/CacheProvider.js';

class RedisCacheAdapter extends CacheProvider {
  constructor(url = process.env.REDIS_URL || 'redis://localhost:6379') {
    super();
    this.client = createClient({ url });
    this.client.on('error', (err) => console.error('[RedisCacheAdapter] Erro no Redis:', err));
    this.conectado = false;
  }

  async #garantirConexao() {
    if (!this.conectado) {
      await this.client.connect();
      this.conectado = true;
    }
  }

  async obter(chave) {
    await this.#garantirConexao();
    const valor = await this.client.get(chave);
    return valor ? JSON.parse(valor) : null;
  }

  async definir(chave, valor, ttlSegundos = 3600) {
    await this.#garantirConexao();
    await this.client.set(chave, JSON.stringify(valor), { EX: ttlSegundos });
  }

  async desconectar() {
    if (this.conectado) {
      await this.client.quit();
      this.conectado = false;
    }
  }
}

export { RedisCacheAdapter };
export default RedisCacheAdapter;
