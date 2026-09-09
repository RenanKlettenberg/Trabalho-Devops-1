import { Moeda } from '../../../../src/domain/entities/Moeda.js';

describe('Entidade de Domínio: Moeda', () => {
  it('deve aceitar moedas suportadas pelo sistema', () => {
    expect(() => new Moeda({ codigo: 'USD', simbolo: '$' })).not.toThrow();
    expect(() => new Moeda({ codigo: 'BRL', simbolo: 'R$' })).not.toThrow();
    expect(() => new Moeda({ codigo: 'EUR', simbolo: '€' })).not.toThrow();
  });

  it('deve lançar erro (MoedaInvalidaException) para códigos desconhecidos', () => {
    expect(() => new Moeda({ codigo: 'XYZS', simbolo: 'XYZS' })).toThrow('Moeda não suportada');
  });
});