const amqp = require('amqplib');

let channel = null;

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  O healthcheck do RabbitMQ no docker-compose confirma que o processo está no
  ar, mas o listener AMQP (porta 5672) pode levar mais um instante para aceitar
  conexões. Sem esta repetição, o orquestrador morre com ECONNREFUSED sempre
  que sobe junto com o RabbitMQ pela primeira vez.
*/
async function connectRabbitMQ({ tentativas = 20, intervaloMs = 3000 } = {}) {
  if (channel) return channel;

  let ultimoErro;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
      );

      channel = await connection.createChannel();
      return channel;
    } catch (erro) {
      ultimoErro = erro;
      console.warn(`[orquestrador] Tentativa ${tentativa}/${tentativas} de conectar ao RabbitMQ falhou: ${erro.message}`);

      if (tentativa < tentativas) await esperar(intervaloMs);
    }
  }

  throw ultimoErro;
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
