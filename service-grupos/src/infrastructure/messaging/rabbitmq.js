import amqp from 'amqplib';

/*
  Conexão com o RabbitMQ.

  Este arquivo é a única parte do serviço que sabe que o broker é RabbitMQ.
  O resto do código fala só em "publicar mensagem" e "consumir fila", então
  trocar o broker um dia significaria mexer apenas aqui.
*/

let connection = null;
let channel = null;

function urlDoBroker() {
    return process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
}

function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  O RabbitMQ leva alguns segundos para aceitar conexões depois que o container
  sobe. Sem essa repetição o serviço morre no `docker compose up` por tentar
  conectar cedo demais.
*/
async function conectarRabbitMQ({ tentativas = 10, intervaloMs = 3000 } = {}) {
    if (channel) return channel;

    let ultimoErro;

    for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
        try {
            connection = await amqp.connect(urlDoBroker());
            channel = await connection.createChannel();

            // Processa uma mensagem por vez: evita que o serviço puxe a fila
            // inteira para a memória e trave sob carga.
            await channel.prefetch(1);

            connection.on('error', (erro) => {
                console.error('[rabbitmq] Erro na conexão:', erro.message);
            });

            connection.on('close', () => {
                console.warn('[rabbitmq] Conexão encerrada.');
                connection = null;
                channel = null;
            });

            console.log('[rabbitmq] Conectado.');
            return channel;
        } catch (erro) {
            ultimoErro = erro;
            connection = null;
            channel = null;
            console.warn(`[rabbitmq] Tentativa ${tentativa}/${tentativas} falhou: ${erro.message}`);

            if (tentativa < tentativas) await esperar(intervaloMs);
        }
    }

    throw ultimoErro;
}

/*
  `durable: true` faz a fila sobreviver a um restart do broker. Combinado com
  `persistent: true` na publicação, a mensagem não se perde se o RabbitMQ cair
  antes de alguém consumir.
*/
async function declararFilas(filas) {
    const canal = await conectarRabbitMQ();

    for (const fila of filas) {
        await canal.assertQueue(fila, { durable: true });
    }

    return canal;
}

async function publicarEmFila(fila, mensagem, opcoes = {}) {
    const canal = await conectarRabbitMQ();

    await canal.assertQueue(fila, { durable: true });

    return canal.sendToQueue(fila, Buffer.from(JSON.stringify(mensagem)), {
        persistent: true,
        ...opcoes,
    });
}

async function fecharConexao() {
    if (channel) {
        await channel.close();
        channel = null;
    }

    if (connection) {
        await connection.close();
        connection = null;
    }
}

function getChannel() {
    return channel;
}

export { conectarRabbitMQ, declararFilas, publicarEmFila, fecharConexao, getChannel };
