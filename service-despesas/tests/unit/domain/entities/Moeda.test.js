import Moeda from '../../../../src/domain/entities/Moeda.js';
import { MoedaInvalidaException } from '../../../../src/domain/exceptions/DomainExceptions.js';

describe('Moeda', () => {
  it('aceita um código ISO-4217 válido', () => {
    expect(new Moeda('BRL').codigo).toBe('BRL');
  });

  it('normaliza para maiúsculas e remove espaços', () => {
    expect(new Moeda(' usd ').codigo).toBe('USD');
  });

  it.each(['R$', 'BR', '', undefined, null])('rejeita código inválido: %p', (codigo) => {
    expect(() => new Moeda(codigo)).toThrow(MoedaInvalidaException);
  });

  it('equals compara pelo código', () => {
    expect(new Moeda('EUR').equals(new Moeda('eur'))).toBe(true);
    expect(new Moeda('EUR').equals(new Moeda('USD'))).toBe(false);
  });

  it('toString retorna o código da moeda', () => {
    expect(new Moeda('BRL').toString()).toBe('BRL');
  });
});
