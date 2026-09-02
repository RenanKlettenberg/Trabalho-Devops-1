const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
  if (channel) return channel;

  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
  );

  channel = await connection.createChannel();
  return channel;
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
