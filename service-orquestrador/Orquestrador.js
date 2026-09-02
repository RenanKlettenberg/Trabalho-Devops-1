const { connectRabbitMQ, getChannel } = require('./rabbitmq');

const sagaStateDb = {};

async function configurarFilas() {
    const channel = await connectRabbitMQ();

    const filas = [
        'service_viagem/usuario',
        'service_viagem/despesa',
        'service_viagem/grupos',
        'service_despesa/viagem',
        'service_despesa/grupos',
        'service_despesa/usuario',
        'service_grupos/viagem',
        'service_grupos/usuario',
        'service_grupos/despesa',
        'service_usuario/viagem',
        'service_usuario/despesa',
        'service_usuario/grupos',
        'cmd_registrar_despesa',
        'resposta_registrar_despesa',
        'cmd_cancelar_despesa',
        'resposta_cancelar_despesa',
    ];

    for (const fila of filas) {
        await channel.assertQueue(fila, { durable: true });
    }

    console.log('[Orquestrador] Filas RabbitMQ configuradas.');
    return channel;
}

if (require.main === module) {
    configurarFilas()
        .then(() => console.log('[Orquestrador] Serviço inicializado.'))
        .catch((error) => {
            console.error('[Orquestrador] Falha ao configurar filas:', error);
            process.exit(1);
        });
}

module.exports = { configurarFilas, sagaStateDb, getChannel };

