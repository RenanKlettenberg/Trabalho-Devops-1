import { Categoria } from '../../../../src/domain/entities/Categoria.js';

describe('Entidade de Domínio: Categoria', () => {
  it('deve aceitar categorias padrão do sistema', () => {
    expect(() => new Categoria('ALIMENTACAO')).not.toThrow();
    expect(() => new Categoria('TRANSPORTE')).not.toThrow();
    expect(() => new Categoria('HOSPEDAGEM')).not.toThrow();
  });

  it('deve lançar erro para categorias não mapeadas', () => {
    expect(() => new Categoria('COMPRAS_ALEATORIAS')).toThrow('Categoria inválida ou não suportada');
  });
});