import { createClient } from 'redis';

class RedisCacheAdapter {
  constructor(url = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.client = createClient({ url });
    this.client.on('error', (error) => console.error('[Redis]', error.message));
  }

  async conectar() {
    if (!this.client.isOpen) await this.client.connect();
  }

  async desconectar() {
    if (this.client.isOpen) await this.client.quit();
  }

  async salvar(chave, valor, ttl = 3600) {
    await this.client.set(chave, JSON.stringify(valor), { EX: ttl });
  }

  async buscar(chave) {
    const valor = await this.client.get(chave);
    return valor === null ? null : JSON.parse(valor);
  }
}

export { RedisCacheAdapter };
export default RedisCacheAdapter;
