import { jest } from '@jest/globals';
import { CancelarDespesaSaga } from '../../../../src/application/sagas/CancelarDespesaSaga.js';

describe('Saga: CancelarDespesa', () => {
  it('deve concluir a saga quando service-despesas confirma a compensação', async () => {
    const mockRpcClient = {
      requisitar: jest.fn().mockResolvedValue({ status: 'SUCESSO', evento: 'DESPESAS_COMPENSADAS' })
    };
    const mockSagaRepository = { salvar: jest.fn((saga) => saga) };

    const saga = new CancelarDespesaSaga(mockRpcClient, mockSagaRepository);
    const resultado = await saga.execute({ eventoId: 'evento-505' });

    expect(mockRpcClient.requisitar).toHaveBeenCalledWith(
      'cmd_cancelar_despesa',
      'resposta_cancelar_despesa',
      { eventoId: 'evento-505' },
      { correlationId: resultado.id }
    );
    expect(resultado.status).toBe('CONCLUIDA');
    expect(resultado.payload).toEqual({ eventoId: 'evento-505' });
  });

  it('deve marcar a saga como FALHA quando a comunicação falha (timeout)', async () => {
    const mockRpcClient = {
      requisitar: jest.fn().mockRejectedValue(new Error('Timeout aguardando resposta'))
    };
    const mockSagaRepository = { salvar: jest.fn((saga) => saga) };

    const saga = new CancelarDespesaSaga(mockRpcClient, mockSagaRepository);
    const resultado = await saga.execute({ eventoId: 'evento-inexistente' });

    expect(resultado.status).toBe('FALHA');
    expect(resultado.resultado.motivo).toBe('ERRO_COMUNICACAO');
  });
});
