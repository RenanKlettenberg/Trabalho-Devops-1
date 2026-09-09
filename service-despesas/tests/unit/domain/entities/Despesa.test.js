import { Despesa } from '../../../../src/domain/entities/Despesa.js';

describe('Entidade: Despesa', () => {
  it('deve instanciar uma despesa com dados válidos', () => {
    const despesa = new Despesa({
      descricao: 'Jantar em Paris',
      valor: 150.0,
      moedaOriginal: 'EUR',
      categoria: 'ALIMENTACAO',
      viagemId: 'v-123'
    });

    expect(despesa).toBeDefined();
    expect(despesa.status).toBe('ATIVA');
    expect(despesa.valor).toBe(150.0);
  });

  it('deve lançar um erro caso o valor da despesa seja menor ou igual a zero', () => {
    expect(() => {
      new Despesa({ valor: 0, moedaOriginal: 'BRL', categoria: 'OUTROS' });
    }).toThrow('O valor da despesa deve ser maior que zero');
  });

  it('deve mudar o status para ESTORNADA quando o método cancelar() for chamado', () => {
    const despesa = new Despesa({ /* ... dados mock ... */ valor: 10, moedaOriginal: 'BRL', categoria: 'EXTRA', viagemId: 'v-1', descricao: 'Teste' });
    despesa.cancelar();
    expect(despesa.status).toBe('ESTORNADA');
  });
});