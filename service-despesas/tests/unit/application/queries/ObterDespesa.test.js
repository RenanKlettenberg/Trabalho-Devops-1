import { jest } from '@jest/globals';
import { ObterDespesaQuery } from '../../../../src/application/queries/ObterDespesa/ObterDespesaQuery.js';

describe('Query: ObterDespesa', () => {
  it('deve retornar a despesa encontrada pelo repositório', async () => {
    const despesaEncontrada = { id: 'd-1', descricao: 'Táxi' };
    const mockRepository = { buscarPorId: jest.fn().mockResolvedValue(despesaEncontrada) };

    const query = new ObterDespesaQuery(mockRepository);
    const resultado = await query.execute('d-1');

    expect(mockRepository.buscarPorId).toHaveBeenCalledWith('d-1');
    expect(resultado).toBe(despesaEncontrada);
  });

  it('deve retornar null quando o repositório não encontra a despesa', async () => {
    const mockRepository = { buscarPorId: jest.fn().mockResolvedValue(null) };

    const query = new ObterDespesaQuery(mockRepository);
    const resultado = await query.execute('inexistente');

    expect(resultado).toBeNull();
  });
});
