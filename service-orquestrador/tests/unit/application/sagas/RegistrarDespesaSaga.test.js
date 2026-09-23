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

  describe('passo opcional VALIDAR_GRUPO (despesa compartilhada)', () => {
    const dadosComGrupo = { ...dadosDespesa, gruId: 4 };

    it('não chama a fila de validação quando a despesa não tem gruId (despesa pessoal)', async () => {
      const mockRpcClient = {
        requisitar: jest.fn().mockResolvedValue({ status: 'SUCESSO', despesaId: 'd-1' })
      };
      const saga = new RegistrarDespesaSaga(mockRpcClient, { salvar: jest.fn((s) => s) });

      await saga.execute(dadosDespesa);

      expect(mockRpcClient.requisitar).toHaveBeenCalledTimes(1);
      expect(mockRpcClient.requisitar).not.toHaveBeenCalledWith('cmd_validar_grupo', expect.anything(), expect.anything(), expect.anything());
    });

    it('valida o grupo, registra a despesa e vincula ao grupo quando gruId é informado', async () => {
      const mockRpcClient = {
        requisitar: jest.fn()
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'GRUPO_VALIDADO' })
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESA_REGISTRADA', despesa: { id: 'd-1' } })
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESA_VINCULADA_AO_GRUPO' })
      };
      const saga = new RegistrarDespesaSaga(mockRpcClient, { salvar: jest.fn((s) => s) });

      const resultado = await saga.execute(dadosComGrupo);

      expect(mockRpcClient.requisitar).toHaveBeenNthCalledWith(
        1,
        'cmd_validar_grupo',
        'resposta_validar_grupo',
        { gruId: 4 },
        { correlationId: resultado.id }
      );
      expect(mockRpcClient.requisitar).toHaveBeenNthCalledWith(
        2,
        'cmd_registrar_despesa',
        'resposta_registrar_despesa',
        expect.objectContaining({ viagemId: 'v-1' }),
        { correlationId: resultado.id }
      );
      expect(mockRpcClient.requisitar).toHaveBeenNthCalledWith(
        3,
        'cmd_vincular_despesa_grupo',
        'resposta_vincular_despesa_grupo',
        { gru_id: 4, des_id: 'd-1', valor: dadosComGrupo.valor },
        { correlationId: resultado.id }
      );
      expect(resultado.status).toBe('CONCLUIDA');
    });

    it('marca a saga como FALHA se a despesa registrar mas o vínculo com o grupo falhar', async () => {
      const mockRpcClient = {
        requisitar: jest.fn()
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'GRUPO_VALIDADO' })
          .mockResolvedValueOnce({ status: 'SUCESSO', evento: 'DESPESA_REGISTRADA', despesa: { id: 'd-1' } })
          .mockResolvedValueOnce({ status: 'FALHA', erro: { code: 'GRU05', message: 'Grupo sem participantes.' } })
      };
      const saga = new RegistrarDespesaSaga(mockRpcClient, { salvar: jest.fn((s) => s) });

      const resultado = await saga.execute(dadosComGrupo);

      expect(mockRpcClient.requisitar).toHaveBeenCalledTimes(3);
      expect(resultado.status).toBe('FALHA');
      expect(resultado.passos).toHaveLength(3);
      expect(resultado.passos[2].nome).toBe('VINCULAR_DESPESA_GRUPO');
    });

    it('não chega a registrar a despesa se a validação do grupo falhar', async () => {
      const mockRpcClient = {
        requisitar: jest.fn().mockResolvedValue({ status: 'FALHA', erro: { code: 'GRU03', message: 'Grupo não encontrado.' } })
      };
      const saga = new RegistrarDespesaSaga(mockRpcClient, { salvar: jest.fn((s) => s) });

      const resultado = await saga.execute(dadosComGrupo);

      expect(mockRpcClient.requisitar).toHaveBeenCalledTimes(1); // só VALIDAR_GRUPO, nunca chegou em REGISTRAR_DESPESA
      expect(resultado.status).toBe('FALHA');
      expect(resultado.passos).toHaveLength(1);
      expect(resultado.passos[0].nome).toBe('VALIDAR_GRUPO');
    });
  });
});
