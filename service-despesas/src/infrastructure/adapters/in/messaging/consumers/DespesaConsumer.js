import amqp from 'amqplib';

/* O consumer adapta RabbitMQ para os handlers da aplicação. */
export async function iniciarConsumerDespesa({
  registrarDespesa,
  compensarDespesa,
  url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
}) {
  const connection = await amqp.connect(url);

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

    try {
      const payload = JSON.parse(msg.content.toString());
      const despesa = await registrarDespesa.execute(payload);
      const resposta = {
        sagaId: msg.properties.correlationId,
        status: 'SUCESSO',
        evento: 'DESPESA_REGISTRADA',
        despesaId: despesa.id
      };
      const filaResposta = msg.properties.replyTo || 'resposta_registrar_despesa';
      await channel.assertQueue(filaResposta, { durable: true });
      channel.sendToQueue(filaResposta, Buffer.from(JSON.stringify(resposta)), { persistent: true });
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false);
      console.error('[service-despesas] Falha ao registrar despesa:', error);
    }
  });

  channel.consume('cmd_cancelar_despesa', async (msg) => {
    if (!msg) return;

    try {
      await compensarDespesa.processarComando(msg);
      channel.ack(msg);
    } catch (error) {
      channel.nack(msg, false, false);
      console.error('[service-despesas] Falha ao compensar despesa:', error);
    }
  });

  console.log('[service-despesas] Consumer conectado às filas da saga.');
  return { connection, channel };
}

export default iniciarConsumerDespesa;
