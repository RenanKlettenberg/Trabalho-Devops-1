import { connectRabbitMQ, assertQueue } from './rabbitmq.js';

/*
  Consumer do microserviço de grupos.
  Ele escuta filas dedicadas ao domínio de grupos na saga.

  Filas de entrada:
    - service_grupos/viagem
    - service_grupos/usuario
    - service_grupos/despesa
*/
export async function iniciarConsumerGrupos() {
  const channel = await connectRabbitMQ();

  const filas = [
    'service_grupos/viagem',
    'service_grupos/usuario',
    'service_grupos/despesa'
  ];

  for (const fila of filas) {
    await assertQueue(fila, { durable: true });
  }

  for (const fila of filas) {
    channel.consume(fila, async (msg) => {
      if (!msg) return;

      const payload = JSON.parse(msg.content.toString());
      console.log(`[service-grupos] Mensagem recebida em ${fila}:`, payload);

      const resposta = {
        sagaId: payload.sagaId,
        status: 'SUCESSO',
        servico: 'grupos',
        evento: 'GRUPO_PROCESSADO',
        dataProcessamento: new Date().toISOString()
      };

      if (msg.properties.replyTo) {
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(resposta)), {
          persistent: true
        });
      }

      channel.ack(msg);
    });
  }

  console.log('[service-grupos] Consumer ativo para as filas do serviço de grupos.');
  return channel;
}

export default iniciarConsumerGrupos;
