import { RegistrarDespesaCommand } from '../../../../../src/application/commands/RegistrarDespesa/RegistrarDespesaCommand.js';

describe('Command: RegistrarDespesa', () => {
  it('deve salvar a despesa no repositório', async () => {
    // Mock do repositório de despesas
    const mockRepository = { 
      salvar: jest.fn().mockResolvedValue(true), 
      buscarPorId: jest.fn() 
    };
    
    const command = new RegistrarDespesaCommand(mockRepository);
    
    await command.execute({ 
      descricao: 'Táxi', 
      valor: 50, 
      moeda: 'BRL', 
      categoria: 'TRANSPORTE', 
      viagemId: 'v-1' 
    });

    expect(mockRepository.salvar).toHaveBeenCalledTimes(1);
  });
});