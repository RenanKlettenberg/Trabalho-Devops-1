import { jest } from '@jest/globals';
import { RegistrarDespesaCommand } from '../../../../src/application/commands/RegistrarDespesa/RegistrarDespesaCommand.js';
import { Despesa } from '../../../../src/domain/entities/Despesa.js';

describe('Command: RegistrarDespesa', () => {
  it('deve salvar a despesa no repositório', async () => {
    // Mock do repositório de despesas
    const mockRepository = { salvar: jest.fn().mockResolvedValue(true) };

    const command = new RegistrarDespesaCommand(mockRepository);

    const despesa = await command.execute({
      descricao: 'Táxi',
      valor: 50,
      moeda: 'BRL',
      categoria: 'TRANSPORTE',
      viagemId: 'v-1'
    });

    expect(mockRepository.salvar).toHaveBeenCalledTimes(1);
    expect(despesa.status).toBe('ATIVA');
  });

  it('deve reaproveitar a instância quando já recebe uma Despesa pronta', async () => {
    const mockRepository = { salvar: jest.fn().mockResolvedValue(true) };
    const command = new RegistrarDespesaCommand(mockRepository);

    const despesaExistente = new Despesa({
      descricao: 'Hotel',
      valor: 300,
      moeda: 'BRL',
      categoria: 'HOSPEDAGEM',
      viagemId: 'v-2'
    });

    const resultado = await command.execute(despesaExistente);

    expect(resultado).toBe(despesaExistente);
    expect(mockRepository.salvar).toHaveBeenCalledWith(despesaExistente);
  });
});