export class Categoria {
  constructor({ id, nome, descricao, cor, ativo = true }) {
    this.id = id || crypto.randomUUID();
    this.nome = nome;
    this.descricao = descricao || '';
    this.cor = cor || '#000000';
    this.ativo = ativo;
    
    this.validar();
  }

  validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new Error("Categoria inválida ou não suportada");
    }
    if (this.nome.length > 50) {
      throw new Error("O nome da categoria deve ter no máximo 50 caracteres.");
    }
    if (!/^#[0-9A-F]{6}$/i.test(this.cor)) {
      throw new Error("A cor deve ser um hexadecimal válido (ex: #FF0000).");
    }
  }

  atualizarDados(nome, descricao, cor) {
    this.nome = nome;
    this.descricao = descricao;
    this.cor = cor;
    this.validar();
  }

  desativar() {
    this.ativo = false;
  }

  ativar() {
    this.ativo = true;
  }
}

