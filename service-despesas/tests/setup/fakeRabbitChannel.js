import { jest } from '@jest/globals';

/**
 * Canal AMQP em memória: captura o handler passado a `consume` por fila e
 * registra o que foi publicado via `sendToQueue`, sem precisar de um
 * RabbitMQ de verdade.
 */
function criarFakeChannel() {
  const handlersPorFila = {};
  const mensagensPublicadas = [];

  const channel = {
    assertQueue: jest.fn(async () => {}),
    consume: jest.fn((fila, handler) => {
      handlersPorFila[fila] = handler;
    }),
    sendToQueue: jest.fn((fila, buffer, props) => {
      mensagensPublicadas.push({ fila, body: JSON.parse(buffer.toString()), props });
    }),
    ack: jest.fn(),
  };

  function simularMensagem(fila, payload, { correlationId, replyTo } = {}) {
    const msg = {
      content: Buffer.from(JSON.stringify(payload)),
      properties: { correlationId, replyTo },
    };
    return handlersPorFila[fila](msg);
  }

  return { channel, mensagensPublicadas, simularMensagem };
}

export { criarFakeChannel };
export default criarFakeChannel;
