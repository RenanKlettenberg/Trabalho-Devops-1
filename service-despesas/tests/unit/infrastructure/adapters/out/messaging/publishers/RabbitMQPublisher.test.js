import { jest } from '@jest/globals';
import { RabbitMQPublisher } from '../../../../../../../src/infrastructure/adapters/out/messaging/publishers/RabbitMQPublisher.js';

function criarCanalMock() {
  return {
    assertExchange: jest.fn().mockResolvedValue(true),
    assertQueue: jest.fn().mockResolvedValue(true),
    publish: jest.fn().mockReturnValue(true),
    sendToQueue: jest.fn().mockReturnValue(true)
  };
}

describe('RabbitMQPublisher (unitário, canal mockado)', () => {
  it('publicarEvento deve garantir o exchange e publicar a mensagem serializada', async () => {
    const canal = criarCanalMock();
    const publisher = new RabbitMQPublisher(canal);

    await publisher.publicarEvento('despesas_events', 'despesa.criada', { id: 'd-1' });

    expect(canal.assertExchange).toHaveBeenCalledWith('despesas_events', 'topic', { durable: true });
    expect(canal.publish).toHaveBeenCalledWith(
      'despesas_events',
      'despesa.criada',
      Buffer.from(JSON.stringify({ id: 'd-1' })),
      { persistent: true }
    );
  });

  it('publicarEvento deve avisar (sem lançar) quando o buffer de publicação está cheio', async () => {
    const canal = criarCanalMock();
    canal.publish.mockReturnValue(false);
    const publisher = new RabbitMQPublisher(canal);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(publisher.publicarEvento('x', 'y', {})).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('publicarEvento deve lançar um erro genérico quando o canal falha', async () => {
    const canal = criarCanalMock();
    canal.assertExchange.mockRejectedValue(new Error('canal fechado'));
    const publisher = new RabbitMQPublisher(canal);

    await expect(publisher.publicarEvento('x', 'y', {})).rejects.toThrow('Falha no serviço de mensageria.');
  });

  it('enviarParaFila deve garantir a fila e enviar a mensagem serializada', async () => {
    const canal = criarCanalMock();
    const publisher = new RabbitMQPublisher(canal);

    await publisher.enviarParaFila('cmd_registrar_despesa', { valor: 10 });

    expect(canal.assertQueue).toHaveBeenCalledWith('cmd_registrar_despesa', { durable: true });
    expect(canal.sendToQueue).toHaveBeenCalledWith(
      'cmd_registrar_despesa',
      Buffer.from(JSON.stringify({ valor: 10 })),
      { persistent: true }
    );
  });

  it('enviarParaFila deve propagar o erro original quando o canal falha', async () => {
    const canal = criarCanalMock();
    const erroOriginal = new Error('fila inexistente');
    canal.assertQueue.mockRejectedValue(erroOriginal);
    const publisher = new RabbitMQPublisher(canal);

    await expect(publisher.enviarParaFila('fila-x', {})).rejects.toThrow(erroOriginal);
  });

  it('publicar deve lançar erro se o publisher não estiver conectado', async () => {
    const publisher = new RabbitMQPublisher(null);

    await expect(publisher.publicar('fila-x', {})).rejects.toThrow('Publisher não conectado ao RabbitMQ.');
  });

  it('desconectar deve fechar canal e conexão quando existirem', async () => {
    const canal = { close: jest.fn().mockResolvedValue(true) };
    const conexao = { close: jest.fn().mockResolvedValue(true) };
    const publisher = new RabbitMQPublisher(canal);
    publisher.connection = conexao;

    await publisher.desconectar();

    expect(canal.close).toHaveBeenCalled();
    expect(conexao.close).toHaveBeenCalled();
    expect(publisher.channel).toBeNull();
    expect(publisher.connection).toBeNull();
  });
});
