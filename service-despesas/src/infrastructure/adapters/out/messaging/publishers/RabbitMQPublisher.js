import amqp from 'amqplib';

class RabbitMQPublisher {
  /**
   * @param {Object} rabbitmqChannel - Canal do amqplib
   */
  constructor(rabbitmqChannel) {
    this.channel = rabbitmqChannel;
    this.connection = null;
  }

  async conectar(url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672') {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async desconectar() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.channel = null;
    this.connection = null;
  }

  /**
   * Publica uma mensagem em um Exchange
   * @param {String} exchange - Nome do Exchange (ex: 'despesas_events')
   * @param {String} routingKey - Chave de roteamento (ex: 'despesa.criada')
   * @param {Object} mensagem - Objeto JavaScript com o payload
   */
  async publicarEvento(exchange, routingKey, mensagem) {
    try {
      // Garante que o exchange existe (tipo 'topic' é ideal para eventos de domínio)
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const payload = Buffer.from(JSON.stringify(mensagem));
      
      const publicado = this.channel.publish(exchange, routingKey, payload, {
        persistent: true // Mensagens sobrevivem a reinicializações do broker
      });

      if (publicado) {
        console.log(`[>>] Evento publicado no RabbitMQ: ${routingKey}`);
      } else {
        console.warn(`[!?] Buffer de publicação cheio ao enviar: ${routingKey}`);
      }
    } catch (error) {
      console.error(`[X] Erro ao publicar mensagem no RabbitMQ: ${error.message}`);
      throw new Error('Falha no serviço de mensageria.');
    }
  }

  /**
   * Envia uma mensagem direta para uma fila específica (ex: comandos ou sagas)
   */
  async enviarParaFila(nomeDaFila, mensagem) {
    try {
      await this.channel.assertQueue(nomeDaFila, { durable: true });
      const payload = Buffer.from(JSON.stringify(mensagem));
      
      this.channel.sendToQueue(nomeDaFila, payload, { persistent: true });
      console.log(`[>>] Mensagem enviada diretamente para a fila: ${nomeDaFila}`);
    } catch (error) {
      console.error(`[X] Erro ao enviar mensagem para a fila: ${error.message}`);
      throw error;
    }
  }

  async publicar(nomeDaFila, mensagem) {
    if (!this.channel) throw new Error('Publisher não conectado ao RabbitMQ.');
    await this.channel.assertQueue(nomeDaFila, { durable: true });
    return this.channel.sendToQueue(
      nomeDaFila,
      Buffer.from(JSON.stringify(mensagem)),
      { persistent: true }
    );
  }
}

export { RabbitMQPublisher };
export default RabbitMQPublisher;