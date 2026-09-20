import crypto from 'crypto';
import amqp from 'amqplib';

/*
 * Cliente RPC sobre RabbitMQ: publica um comando numa fila e aguarda a
 * resposta correspondente numa fila de resposta, casando pedido/resposta
 * pela propriedade AMQP `correlationId` (padrão já usado pelo
 * DespesaConsumer/CompensarDespesasCommandHandler em service-despesas).
 */
export class RabbitMQRpcClient {
  constructor(url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672') {
    this.url = url;
    this.connection = null;
    this.channel = null;
    this.pendentes = new Map();
    this.filasConsumidas = new Set();
  }

  async conectar() {
    if (this.channel) return this.channel;
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async desconectar() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.channel = null;
    this.connection = null;
  }

  async _garantirConsumoResposta(filaResposta) {
    if (this.filasConsumidas.has(filaResposta)) return;

    await this.channel.assertQueue(filaResposta, { durable: true });
    this.channel.consume(filaResposta, (msg) => {
      if (!msg) return;
      this.channel.ack(msg);

      let corpo;
      try {
        corpo = JSON.parse(msg.content.toString());
      } catch (erro) {
        return;
      }

      // Nem todo respondente ecoa o correlationId como propriedade AMQP da
      // resposta (ex: DespesaConsumer.js só devolve no corpo, como
      // `sagaId`) — aceita os dois formatos.
      const correlationId = msg.properties.correlationId || corpo.sagaId;
      const pendente = this.pendentes.get(correlationId);
      if (!pendente) return;

      this.pendentes.delete(correlationId);
      clearTimeout(pendente.timeout);
      pendente.resolve(corpo);
    });

    this.filasConsumidas.add(filaResposta);
  }

  async requisitar(filaComando, filaResposta, payload, { correlationId = crypto.randomUUID(), timeoutMs = 5000 } = {}) {
    if (!this.channel) await this.conectar();
    await this._garantirConsumoResposta(filaResposta);
    await this.channel.assertQueue(filaComando, { durable: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendentes.delete(correlationId);
        reject(new Error(`Timeout aguardando resposta em "${filaResposta}" (correlationId=${correlationId})`));
      }, timeoutMs);

      this.pendentes.set(correlationId, { resolve, reject, timeout });

      this.channel.sendToQueue(filaComando, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        correlationId,
        replyTo: filaResposta,
      });
    });
  }
}

export default RabbitMQRpcClient;
