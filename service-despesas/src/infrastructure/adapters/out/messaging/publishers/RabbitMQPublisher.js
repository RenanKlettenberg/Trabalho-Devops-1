import amqp from 'amqplib';

/*
  Classe responsável por publicar mensagens em filas do RabbitMQ.
  Ela é usada principalmente para responder ao orquestrador
  com o resultado da operação da saga.
*/
export class RabbitMQPublisher {
  constructor(url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672') {
    this.url = url;
    this.connection = null;
    this.channel = null;
  }

  async conectar() {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async publicar(fila, payload) {
    if (!this.channel) {
      await this.conectar();
    }

    await this.channel.assertQueue(fila, { durable: true });

    this.channel.sendToQueue(
      fila,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    return true;
  }

  async desconectar() {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      await this.connection.close();
    }
  }
}

export default RabbitMQPublisher;
