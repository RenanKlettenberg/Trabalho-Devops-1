import { ObterDashboardFinanceiroQuery } from '../../../../../src/application/queries/ObterDashboardFinanceiro/ObterDashboardFinanceiroQuery.js';

describe('Query: ObterDashboardFinanceiro', () => {
  it('deve retornar as despesas consolidadas na moeda principal', async () => {
    // Mocks dos repositórios
    const mockDespesaRepo = {
      buscarPorViagem: jest.fn().mockResolvedValue([{ valor: 10, moeda: 'USD' }])
    };
    const mockCambioRepo = {
      obterTaxa: jest.fn().mockResolvedValue(5.0) // Simulando 1 USD = 5 BRL
    };
    
    const query = new ObterDashboardFinanceiroQuery(mockDespesaRepo, mockCambioRepo);
    const dashboard = await query.execute({ viagemId: 'v-123', moedaDestino: 'BRL' });

    expect(dashboard.total).toBe(50.0);
    expect(mockCambioRepo.obterTaxa).toHaveBeenCalledWith('USD', 'BRL');
  });
});