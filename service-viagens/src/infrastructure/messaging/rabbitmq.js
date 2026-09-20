import amqp from 'amqplib';

let channel = null;

export async function conectarRabbitMQ() {
  if (channel) return channel;

  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
  );

  channel = await connection.createChannel();
  return channel;
}

export async function enviarParaFila(queueName, payload) {
  const canal = await conectarRabbitMQ();
  await canal.assertQueue(queueName, { durable: true });
  canal.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true });
  return true;
}

export async function fecharConexao() {
  if (channel) {
    await channel.close();
    channel = null;
  }
}