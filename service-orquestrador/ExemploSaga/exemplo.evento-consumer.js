/*
 * EXEMPLO — não é importado por nenhum código real.
 *
 * Lado "assinante" do padrão pub/sub (ver exemplo.publicar-evento.js).
 * Qualquer serviço interessado em saber quando uma despesa é registrada
 * (ex: um futuro serviço de notificações, auditoria, ou até o próprio
 * service-grupos pra invalidar um cache de divisão) cria SUA PRÓPRIA fila,
 * amarra (bind) no exchange com a routing key que interessa, e escuta —
 * sem afetar quem publica nem os outros assinantes.
 *
 * Cada serviço que quiser escutar declara sua própria fila com um nome
 * único (ex: `despesas_events.grupos`) — isso garante que cada assinante
 * recebe TODAS as mensagens que casam com o binding, independente de
 * quantos outros serviços também estão escutando (ao contrário de uma fila
 * compartilhada, onde as mensagens seriam divididas entre os consumers).
 */

import amqp from 'amqplib';

const EXCHANGE = 'despesas_events';

export async function escutarEventosDeDespesa({
  filaAssinante, // nome único por serviço, ex: 'despesas_events.grupos'
  routingPattern = 'despesa.*', // 'despesa.registrada', 'despesa.cancelada', etc.
  aoReceberEvento, // (evento) => Promise<void>
  url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
}) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(filaAssinante, { durable: true });
  await channel.bindQueue(filaAssinante, EXCHANGE, routingPattern);

  channel.consume(filaAssinante, async (msg) => {
    if (!msg) return;

    try {
      const evento = JSON.parse(msg.content.toString());
      await aoReceberEvento(evento, msg.fields.routingKey);
      channel.ack(msg);
    } catch (error) {
      // Fire-and-forget não tem "quem responder" em caso de erro — só
      // decide se vale reprocessar (nack com requeue) ou descartar.
      channel.nack(msg, false, false);
      console.error(`[${filaAssinante}] Falha ao processar evento:`, error);
    }
  });

  console.log(`[${filaAssinante}] Escutando eventos de despesa (${routingPattern}).`);
  return { connection, channel };
}

export default escutarEventosDeDespesa;

/*
 * Uso de exemplo (dentro de outro serviço, no boot):
 *
 *   escutarEventosDeDespesa({
 *     filaAssinante: 'despesas_events.grupos',
 *     aoReceberEvento: async (evento) => {
 *       console.log('Despesa registrada:', evento.despesaId);
 *     },
 *   });
 */
