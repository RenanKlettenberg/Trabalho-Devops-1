import { jest } from '@jest/globals';
import { CompensarDespesaCanceladaCommand } from '../../../../src/application/commands/CompensarDespesaCancelada/CompensarDespesaCanceladaCommand.js';

describe('Command: CompensarDespesaCancelada', () => {
  it('deve buscar as despesas ativas de um evento e atualizar o status para ESTORNADA', async () => {
    // Mock simulando uma despesa que foi encontrada no banco
    const mockDespesa = {
      id: 'd-1',
      status: 'ATIVA',
      cancelar: jest.fn() // Simula o método da entidade que muda o status
    };

    const mockRepository = { 
      buscarPorEventoId: jest.fn().mockResolvedValue([mockDespesa]),
      atualizarEmLote: jest.fn().mockResolvedValue(true)
    };
    
    const command = new CompensarDespesaCanceladaCommand(mockRepository);
    
    await command.execute({ eventoId: 'evento-999' });

    // Verifica se a despesa foi cancelada na memória
    expect(mockDespesa.cancelar).toHaveBeenCalledTimes(1);
    // Verifica se o repositório foi chamado para salvar a alteração
    expect(mockRepository.atualizarEmLote).toHaveBeenCalledWith([mockDespesa]);
  });

  it('não deve chamar atualizarEmLote quando nenhuma despesa é encontrada para o evento', async () => {
    const mockRepository = {
      buscarPorEventoId: jest.fn().mockResolvedValue([]),
      atualizarEmLote: jest.fn().mockResolvedValue(true)
    };

    const command = new CompensarDespesaCanceladaCommand(mockRepository);
    const resultado = await command.execute({ eventoId: 'evento-sem-despesas' });

    expect(mockRepository.atualizarEmLote).not.toHaveBeenCalled();
    expect(resultado).toEqual([]);
  });
});