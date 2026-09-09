export class Moeda {
  constructor({ codigo, simbolo, taxaCambioBase = 1.0 }) {
    this.codigo = codigo; // Ex: BRL, USD, EUR
    this.simbolo = simbolo; // Ex: R$, $, €
    this.taxaCambioBase = taxaCambioBase;
    
    this.validar();
  }

  validar() {
    if (!this.codigo || this.codigo.length !== 3) {
      throw new Error("Moeda não suportada");
    }
    if (!this.simbolo || this.simbolo.trim() === '') {
      throw new Error("O símbolo da moeda é obrigatório.");
    }
    if (this.taxaCambioBase <= 0) {
      throw new Error("A taxa de câmbio base deve ser maior que zero.");
    }
  }

  atualizarTaxa(novaTaxa) {
    if (novaTaxa <= 0) {
      throw new Error("A nova taxa de câmbio deve ser maior que zero.");
    }
    this.taxaCambioBase = novaTaxa;
  }
}

