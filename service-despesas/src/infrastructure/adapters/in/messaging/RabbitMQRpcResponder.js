/**
 * Padrão RPC sobre RabbitMQ usado pelo service-orquestrador
 * (RabbitMQRpcClient): consome uma fila de comando, executa `handler` e
 * responde na fila indicada em `properties.replyTo`, ecoando o
 * `correlationId` recebido — é assim que o cliente casa pedido/resposta.
 *
 * Falhas de negócio (validação, regra de domínio) viram resposta
 * { status: 'FALHA', ... } e a mensagem é confirmada (ack) normalmente:
 * não é um problema de infraestrutura, não deve voltar pra fila.
 */
async function responderComandos(channel, filaComando, handler) {
  await channel.assertQueue(filaComando, { durable: true });

  channel.consume(filaComando, async (msg) => {
    if (!msg) return;

    let resposta;
    try {
      const payload = JSON.parse(msg.content.toString());
      resposta = await handler(payload);
    } catch (erro) {
      resposta = { status: 'FALHA', motivo: erro.message, codigo: erro.codigo };
    }

    const filaResposta = msg.properties.replyTo;
    if (filaResposta) {
      channel.sendToQueue(filaResposta, Buffer.from(JSON.stringify(resposta)), {
        correlationId: msg.properties.correlationId,
        persistent: true,
      });
    }

    channel.ack(msg);
  });
}

export { responderComandos };
export default responderComandos;
