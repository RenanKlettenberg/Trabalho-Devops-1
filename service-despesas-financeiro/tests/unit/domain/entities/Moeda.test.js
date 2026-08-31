import { Moeda } from '../../../../src/domain/entities/Moeda.js';

describe('Entidade de Domínio: Moeda', () => {
  it('deve aceitar moedas suportadas pelo sistema', () => {
    expect(() => new Moeda('USD')).not.toThrow();
    expect(() => new Moeda('BRL')).not.toThrow();
    expect(() => new Moeda('EUR')).not.toThrow();
  });

  it('deve lançar erro (MoedaInvalidaException) para códigos desconhecidos', () => {
    expect(() => new Moeda('XYZ')).toThrow('Moeda não suportada');
  });
});