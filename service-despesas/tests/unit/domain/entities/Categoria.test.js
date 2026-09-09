import { Categoria } from '../../../../src/domain/entities/Categoria.js';

describe('Entidade de Domínio: Categoria', () => {
  it('deve aceitar categorias padrão do sistema', () => {
    expect(() => new Categoria({ id: '01', nome: 'ALIMENTACAO', descricao: 'Despesas com alimentação', cor: '#000000' ,ativo: true})).not.toThrow();
    expect(() => new Categoria({ id: '02', nome: 'TRANSPORTE', descricao: 'Despesas com transporte', cor: '#000000' ,ativo: true})).not.toThrow();
    expect(() => new Categoria({ id: '03', nome: 'HOSPEDAGEM', descricao: 'Despesas com hospedagem', cor: '#000000' ,ativo: true})).not.toThrow();
  });

  it('deve lançar erro para categorias não mapeadas', () => {
    expect(() => new Categoria('COMPRAS_ALEATORIAS')).toThrow('Categoria inválida ou não suportada');
  });
});