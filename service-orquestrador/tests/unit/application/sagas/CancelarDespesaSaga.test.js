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

  describe('desvincular do grupo (despesa compartilhada)', () => {
    it('desvincula do grupo cada despesa estornada quando a despesa original tinha gruId', async () => {
      const mockRpcClient = {
        requisitar: jest.fn()
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESAS_COMPENSADAS', estornadas: ['d-1', 'd-2'] })
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESA_DESVINCULADA_DO_GRUPO' })
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESA_DESVINCULADA_DO_GRUPO' })
      };
      const mockSagaRepository = {
        salvar: jest.fn((saga) => saga),
        buscarPorId: jest.fn().mockResolvedValue({ sag_payload: { gruId: 4 } }),
      };

      const saga = new CancelarDespesaSaga(mockRpcClient, mockSagaRepository);
      const resultado = await saga.execute({ eventoId: 'saga-original-1' });

      expect(mockSagaRepository.buscarPorId).toHaveBeenCalledWith('saga-original-1');
      expect(mockRpcClient.requisitar).toHaveBeenNthCalledWith(
        2,
        'cmd_desvincular_despesa_grupo',
        'resposta_desvincular_despesa_grupo',
        { gru_id: 4, des_id: 'd-1' },
        expect.objectContaining({ correlationId: expect.any(String) })
      );
      expect(mockRpcClient.requisitar).toHaveBeenNthCalledWith(
        3,
        'cmd_desvincular_despesa_grupo',
        'resposta_desvincular_despesa_grupo',
        { gru_id: 4, des_id: 'd-2' },
        expect.objectContaining({ correlationId: expect.any(String) })
      );
      expect(resultado.status).toBe('CONCLUIDA');
    });

    it('não tenta desvincular quando a despesa original era pessoal (sem gruId)', async () => {
      const mockRpcClient = {
        requisitar: jest.fn().mockResolvedValueOnce({ status: 'SUCESSO', estornadas: ['d-1'] })
      };
      const mockSagaRepository = {
        salvar: jest.fn((saga) => saga),
        buscarPorId: jest.fn().mockResolvedValue({ sag_payload: { viagemId: 'v-1' } }),
      };

      const saga = new CancelarDespesaSaga(mockRpcClient, mockSagaRepository);
      const resultado = await saga.execute({ eventoId: 'saga-original-2' });

      expect(mockRpcClient.requisitar).toHaveBeenCalledTimes(1);
      expect(resultado.status).toBe('CONCLUIDA');
    });

    it('continua concluída mesmo se o desvínculo falhar (best-effort)', async () => {
      const mockRpcClient = {
        requisitar: jest.fn()
          .mockResolvedValueOnce({ status: 'SUCESSO', estornadas: ['d-1'] })
          .mockRejectedValueOnce(new Error('Timeout'))
      };
      const mockSagaRepository = {
        salvar: jest.fn((saga) => saga),
        buscarPorId: jest.fn().mockResolvedValue({ sag_payload: { gruId: 4 } }),
      };

      const saga = new CancelarDespesaSaga(mockRpcClient, mockSagaRepository);
      const resultado = await saga.execute({ eventoId: 'saga-original-3' });

      expect(resultado.status).toBe('CONCLUIDA');
      expect(resultado.passos.at(-1)).toMatchObject({ nome: 'DESVINCULAR_DESPESA_GRUPO', status: 'ERRO' });
    });
  });
});
