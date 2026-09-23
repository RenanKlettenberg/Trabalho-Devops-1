import Categoria, { CATEGORIAS_VALIDAS } from '../../../../src/domain/entities/Categoria.js';
import { CategoriaInvalidaException } from '../../../../src/domain/exceptions/DomainExceptions.js';

describe('Categoria', () => {
  it.each(CATEGORIAS_VALIDAS)('aceita a categoria válida %s', (valor) => {
    expect(new Categoria(valor).valor).toBe(valor);
  });

  it('normaliza para maiúsculas e remove espaços', () => {
    expect(new Categoria(' alimentacao ').valor).toBe('ALIMENTACAO');
  });

  it.each(['VIAGEM_ESPACIAL', '', undefined, null])('rejeita categoria inválida: %p', (valor) => {
    expect(() => new Categoria(valor)).toThrow(CategoriaInvalidaException);
  });

  it('listar() retorna todas as categorias válidas', () => {
    expect(Categoria.listar()).toEqual(CATEGORIAS_VALIDAS);
  });

  it('equals compara pelo valor', () => {
    expect(new Categoria('LAZER').equals(new Categoria('lazer'))).toBe(true);
    expect(new Categoria('LAZER').equals(new Categoria('SAUDE'))).toBe(false);
  });

  it('toString retorna o valor da categoria', () => {
    expect(new Categoria('TRANSPORTE').toString()).toBe('TRANSPORTE');
  });
});
