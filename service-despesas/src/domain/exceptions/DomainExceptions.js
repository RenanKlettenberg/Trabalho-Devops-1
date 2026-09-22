class DomainException extends Error {
  constructor(mensagem, codigo) {
    super(mensagem);
    this.name = this.constructor.name;
    this.codigo = codigo;
  }
}

class ValorInvalidoException extends DomainException {
  constructor(valor) {
    super(`Valor da despesa inválido: "${valor}". Deve ser um número maior que zero.`, 'VALOR_INVALIDO');
  }
}

class MoedaInvalidaException extends DomainException {
  constructor(moeda) {
    super(`Moeda inválida: "${moeda}". Use o código ISO-4217 de 3 letras (ex: BRL, USD).`, 'MOEDA_INVALIDA');
  }
}

class CategoriaInvalidaException extends DomainException {
  constructor(categoria) {
    super(`Categoria inválida: "${categoria}".`, 'CATEGORIA_INVALIDA');
  }
}

class ViagemObrigatoriaException extends DomainException {
  constructor() {
    super('Toda despesa precisa estar associada a uma viagem (viagemId).', 'VIAGEM_OBRIGATORIA');
  }
}

class DespesaJaEstornadaException extends DomainException {
  constructor(id) {
    super(`Despesa "${id}" já está estornada.`, 'DESPESA_JA_ESTORNADA');
  }
}

class DespesaNaoEncontradaException extends DomainException {
  constructor(identificador) {
    super(`Despesa não encontrada: "${identificador}".`, 'DESPESA_NAO_ENCONTRADA');
  }
}

export {
  DomainException,
  ValorInvalidoException,
  MoedaInvalidaException,
  CategoriaInvalidaException,
  ViagemObrigatoriaException,
  DespesaJaEstornadaException,
  DespesaNaoEncontradaException,
};
