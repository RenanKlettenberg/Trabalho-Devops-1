/*
 * EXEMPLO — não é importado por nenhum código real.
 *
 * Quarto padrão: "scatter-gather". É um meio-termo entre pub/sub
 * (exemplo.publicar-evento.js, sem resposta nenhuma) e RPC
 * (exemplo.grupo-rpc-client.js, exatamente 1 respondente esperado).
 *
 * Aqui quem publica no canal (exchange topic) ESPERA respostas, mas não
 * sabe de antemão quantos assinantes existem nem quantos vão responder —
 * pode ser 0, 1 ou vários. Por isso não dá pra "esperar a resposta" como
 * no RPC comum (que resolve a Promise assim que a primeira/única resposta
 * chega): aqui você junta o que chegar dentro de uma janela de tempo e
 * segue com o que tiver.
 *
 * Exemplo de uso: service-despesas publica "preciso saber se alguém tem
 * objeção a cancelar este evento" e deixa uma janela de 3s pra quem quiser
 * (grupos? viagens?) responder recusando — se ninguém recusar a tempo,
 * segue em frente.
 */

import amqp from 'amqplib';
import crypto from 'crypto';

const EXCHANGE = 'despesas_events';

export async function publicarEPeraRespostas({
  routingKey,
  mensagem,
  filaResposta, // fila própria pra coletar as respostas deste pedido, ex: `${routingKey}.respostas`
  janelaMs = 3000, // quanto tempo esperar por respostas antes de seguir
  url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
}) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  const correlationId = crypto.randomUUID();
  const respostas = [];

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(filaResposta, { durable: false, exclusive: true });

  channel.consume(filaResposta, (msg) => {
    if (!msg) return;
    if (msg.properties.correlationId !== correlationId) return; // ignora respostas de outros pedidos
    respostas.push(JSON.parse(msg.content.toString()));
    channel.ack(msg);
  });

  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(mensagem)), {
    persistent: true,
    correlationId,
    replyTo: filaResposta,
  });

  // Espera a janela de tempo inteira (não tem como saber quando "todo
  // mundo já respondeu" sem um contrato explícito de quantos assinantes
  // existem) e devolve o que chegou até lá.
  await new Promise((resolve) => setTimeout(resolve, janelaMs));

  await channel.close();
  await connection.close();

  return respostas;
}

export default publicarEPeraRespostas;

/*
 * Lado de quem responde: igual a um assinante comum
 * (exemplo.evento-consumer.js), só que ao processar o evento publica a
 * resposta em `msg.properties.replyTo` com o mesmo `msg.properties.correlationId`
 * — exatamente como um passo de saga responde (exemplo.consumer.js), a
 * diferença é que aqui pode ter mais de um assinante fazendo isso ao mesmo
 * tempo, pro mesmo evento.
 *
 * Uso de exemplo:
 *
 *   const objecoes = await publicarEPeraRespostas({
 *     routingKey: 'despesa.cancelamento.consulta',
 *     mensagem: { eventoId: 'evento-505' },
 *     filaResposta: `despesa.cancelamento.consulta.respostas.${crypto.randomUUID()}`,
 *     janelaMs: 3000,
 *   });
 *
 *   if (objecoes.some(r => r.status === 'RECUSADO')) {
 *     // algum assinante se opôs ao cancelamento dentro da janela
 *   }
 */
