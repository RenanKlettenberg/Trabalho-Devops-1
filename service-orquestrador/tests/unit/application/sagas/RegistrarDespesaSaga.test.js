import { jest } from '@jest/globals';
import { RegistrarDespesaSaga } from '../../../../src/application/sagas/RegistrarDespesaSaga.js';

describe('Saga: RegistrarDespesa', () => {
  const dadosDespesa = {
    descricao: 'Táxi',
    valor: 50,
    moeda: 'BRL',
    categoria: 'TRANSPORTE',
    viagemId: 'v-1'
  };

  it('deve concluir a saga quando service-despesas responde SUCESSO', async () => {
    const mockRpcClient = {
      requisitar: jest.fn().mockResolvedValue({
        status: 'SUCESSO',
        evento: 'DESPESA_REGISTRADA',
        despesaId: 'd-1'
      })
    };
    const mockSagaRepository = { salvar: jest.fn((saga) => saga) };

    const saga = new RegistrarDespesaSaga(mockRpcClient, mockSagaRepository);
    const resultado = await saga.execute(dadosDespesa);

    expect(mockRpcClient.requisitar).toHaveBeenCalledWith(
      'cmd_registrar_despesa',
      'resposta_registrar_despesa',
      expect.objectContaining({ ...dadosDespesa, eventoId: resultado.id }),
      { correlationId: resultado.id }
    );
    expect(resultado.status).toBe('CONCLUIDA');
    expect(resultado.resultado).toEqual({ status: 'SUCESSO', evento: 'DESPESA_REGISTRADA', despesaId: 'd-1' });
    expect(mockSagaRepository.salvar).toHaveBeenCalledTimes(1);
  });

  it('deve marcar a saga como FALHA quando service-despesas responde FALHA', async () => {
    const mockRpcClient = {
      requisitar: jest.fn().mockResolvedValue({ status: 'FALHA', evento: 'ERRO_VALIDACAO' })
    };
    const mockSagaRepository = { salvar: jest.fn((saga) => saga) };

    const saga = new RegistrarDespesaSaga(mockRpcClient, mockSagaRepository);
    const resultado = await saga.execute(dadosDespesa);

    expect(resultado.status).toBe('FALHA');
    expect(resultado.resultado).toEqual({ status: 'FALHA', evento: 'ERRO_VALIDACAO' });
  });

  it('deve marcar a saga como FALHA quando a comunicação falha (timeout)', async () => {
    const mockRpcClient = {
      requisitar: jest.fn().mockRejectedValue(new Error('Timeout aguardando resposta'))
    };
    const mockSagaRepository = { salvar: jest.fn((saga) => saga) };

    const saga = new RegistrarDespesaSaga(mockRpcClient, mockSagaRepository);
    const resultado = await saga.execute(dadosDespesa);

    expect(resultado.status).toBe('FALHA');
    expect(resultado.resultado.motivo).toBe('ERRO_COMUNICACAO');
    expect(resultado.passos[0].status).toBe('ERRO');
  });
});
