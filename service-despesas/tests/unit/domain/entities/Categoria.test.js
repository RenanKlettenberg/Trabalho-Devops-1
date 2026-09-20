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

  it('deve lançar erro quando a cor não é um hexadecimal válido', () => {
    expect(() => new Categoria({ nome: 'LAZER', cor: 'azul' })).toThrow('A cor deve ser um hexadecimal válido (ex: #FF0000).');
  });

  it('deve lançar erro quando o nome passa de 50 caracteres', () => {
    expect(() => new Categoria({ nome: 'A'.repeat(51) })).toThrow('O nome da categoria deve ter no máximo 50 caracteres.');
  });

  it('atualizarDados deve trocar nome, descrição e cor validando de novo', () => {
    const categoria = new Categoria({ nome: 'LAZER', cor: '#123ABC' });

    categoria.atualizarDados('LAZER_2', 'Nova descrição', '#FFFFFF');

    expect(categoria.nome).toBe('LAZER_2');
    expect(categoria.descricao).toBe('Nova descrição');
    expect(categoria.cor).toBe('#FFFFFF');
  });

  it('desativar e ativar devem alternar a flag ativo', () => {
    const categoria = new Categoria({ nome: 'LAZER', cor: '#123ABC' });

    categoria.desativar();
    expect(categoria.ativo).toBe(false);

    categoria.ativar();
    expect(categoria.ativo).toBe(true);
  });
});