import { jest } from '@jest/globals';
import { CompensarDespesasCommandHandler } from '../../../../../../../src/infrastructure/adapters/in/messaging/listeners/CompensarDespesasCommandHandler.js';

function criarMensagem({ eventoId = 'evento-505', correlationId = 'saga-123', replyTo } = {}) {
  return {
    properties: { correlationId, replyTo },
    content: Buffer.from(JSON.stringify({ comando: 'COMPENSAR_DESPESAS', eventoId }))
  };
}

describe('Listener: CompensarDespesasCommandHandler', () => {
  it('deve compensar as despesas do evento e responder na fila indicada em replyTo', async () => {
    const mockDespesa = { id: 'd-1', cancelar: jest.fn() };
    const mockRepository = {
      buscarPorEventoId: jest.fn().mockResolvedValue([mockDespesa]),
      atualizarEmLote: jest.fn().mockResolvedValue(true)
    };
    const mockPublisher = { publicar: jest.fn().mockResolvedValue(true) };

    const handler = new CompensarDespesasCommandHandler(mockRepository, mockPublisher);
    const mensagem = criarMensagem({ eventoId: 'evento-505', correlationId: 'saga-123', replyTo: 'fila_do_orquestrador' });

    const resposta = await handler.processarComando(mensagem);

    expect(mockRepository.buscarPorEventoId).toHaveBeenCalledWith('evento-505');
    expect(mockPublisher.publicar).toHaveBeenCalledWith('fila_do_orquestrador', {
      sagaId: 'saga-123',
      status: 'SUCESSO',
      evento: 'DESPESAS_COMPENSADAS'
    });
    expect(resposta.status).toBe('SUCESSO');
  });

  it('deve usar a fila padrão de resposta quando a mensagem não informa replyTo', async () => {
    const mockRepository = {
      buscarPorEventoId: jest.fn().mockResolvedValue([]),
      atualizarEmLote: jest.fn()
    };
    const mockPublisher = { publicar: jest.fn().mockResolvedValue(true) };

    const handler = new CompensarDespesasCommandHandler(mockRepository, mockPublisher);
    const mensagem = criarMensagem({ replyTo: undefined });

    await handler.processarComando(mensagem);

    expect(mockPublisher.publicar).toHaveBeenCalledWith(
      'resposta_cancelar_despesa',
      expect.objectContaining({ status: 'SUCESSO' })
    );
  });

  it('deve propagar o erro quando o repositório falha, sem publicar resposta', async () => {
    const mockRepository = {
      buscarPorEventoId: jest.fn().mockRejectedValue(new Error('Falha no banco')),
      atualizarEmLote: jest.fn()
    };
    const mockPublisher = { publicar: jest.fn() };

    const handler = new CompensarDespesasCommandHandler(mockRepository, mockPublisher);

    await expect(handler.processarComando(criarMensagem())).rejects.toThrow('Falha no banco');
    expect(mockPublisher.publicar).not.toHaveBeenCalled();
  });
});
