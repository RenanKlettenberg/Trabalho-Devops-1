import { RabbitMQPublisher } from '../../../src/infrastructure/adapters/out/messaging/publishers/RabbitMQPublisher.js';

describe('Integração: RabbitMQPublisher (Saga Orquestrado)', () => {
  let publisher;

  beforeAll(async () => {
    // Inicializa a conexão com o broker de teste (ex: RabbitMQ rodando no Docker local)
    publisher = new RabbitMQPublisher();
    await publisher.conectar();
  });

  afterAll(async () => {
    // Fecha o canal e a conexão após a execução para não travar o Jest
    await publisher.desconectar();
  });

  it('deve publicar a resposta de sucesso na fila do Orquestrador', async () => {
    // Payload padronizado para responder ao Orquestrador do Saga
    const respostaSaga = {
      sagaId: 'saga-123-xyz',
      status: 'SUCESSO',
      eventoId: 'evento-505',
      dataProcessamento: new Date().toISOString()
    };

    // Publica na fila específica de respostas do orquestrador
    const foiPublicado = await publisher.publicar('orquestrador_respostas_queue', respostaSaga);

    // Confirma se o driver de mensageria validou a entrega ao broker
    expect(foiPublicado).toBe(true);
  });
});