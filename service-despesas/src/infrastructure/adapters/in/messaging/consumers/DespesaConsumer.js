import amqp from 'amqplib';

/*
  Consumer do microserviço de despesas.
  Ele escuta os comandos enviados pelo orquestrador e responde
  em filas específicas da saga.

  Filas importantes:
    - cmd_registrar_despesa: comando para registrar despesa
    - cmd_cancelar_despesa: comando para cancelar despesa
    - resposta_registrar_despesa: canal para responder sucesso/erro
    - resposta_cancelar_despesa: canal para responder sucesso/erro
*/
export async function iniciarConsumerDespesa() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
  );

  const channel = await connection.createChannel();

  const filasParaConsumir = [
    'cmd_registrar_despesa',
    'cmd_cancelar_despesa'
  ];

  for (const fila of filasParaConsumir) {
    await channel.assertQueue(fila, { durable: true });
  }

  channel.consume('cmd_registrar_despesa', async (msg) => {
    if (!msg) return;

    const payload = JSON.parse(msg.content.toString());
    console.log('[service-despesas] Comando registrar despesa recebido:', payload);

    const resposta = {
      sagaId: payload.sagaId,
      status: 'SUCESSO',
      evento: 'DESPESA_REGISTRADA',
      dataProcessamento: new Date().toISOString()
    };

    if (msg.properties.replyTo) {
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(resposta)), {
        persistent: true
      });
    } else {
      channel.sendToQueue('resposta_registrar_despesa', Buffer.from(JSON.stringify(resposta)), {
        persistent: true
      });
    }

    channel.ack(msg);
  });

  channel.consume('cmd_cancelar_despesa', async (msg) => {
    if (!msg) return;

    const payload = JSON.parse(msg.content.toString());
    console.log('[service-despesas] Comando cancelar despesa recebido:', payload);

    const resposta = {
      sagaId: payload.sagaId,
      status: 'SUCESSO',
      evento: 'DESPESA_CANCELADA',
      dataProcessamento: new Date().toISOString()
    };

    if (msg.properties.replyTo) {
      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(resposta)), {
        persistent: true
      });
    } else {
      channel.sendToQueue('resposta_cancelar_despesa', Buffer.from(JSON.stringify(resposta)), {
        persistent: true
      });
    }

    channel.ack(msg);
  });

  console.log('[service-despesas] Consumer conectado às filas da saga.');
  return { connection, channel };
}

export default iniciarConsumerDespesa;
