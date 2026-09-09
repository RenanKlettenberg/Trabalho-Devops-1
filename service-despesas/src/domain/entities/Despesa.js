export class Despesa {
  constructor({
    id = crypto.randomUUID(),
    descricao = '',
    valor,
    moedaOriginal,
    moeda,
    categoria,
    viagemId,
    eventoId = null,
    status = 'ATIVA'
  }) {
    if (valor <= 0) {
      throw new Error('O valor da despesa deve ser maior que zero');
    }

    this.id = id;
    this.descricao = descricao;
    this.valor = valor;
    this.moedaOriginal = moedaOriginal || moeda;
    this.categoria = categoria;
    this.viagemId = viagemId;
    this.eventoId = eventoId;
    this.status = status;
  }

  cancelar() {
    this.status = 'ESTORNADA';
  }
}

export default Despesa;
