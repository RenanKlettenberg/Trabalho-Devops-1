import crypto from 'crypto';

const STATUS = {
  INICIADA: 'INICIADA',
  CONCLUIDA: 'CONCLUIDA',
  FALHA: 'FALHA',
};

export class Saga {
  constructor({
    id = crypto.randomUUID(),
    tipo,
    payload,
    status = STATUS.INICIADA,
    resultado = null,
    passos = [],
  }) {
    this.id = id;
    this.tipo = tipo;
    this.payload = payload;
    this.status = status;
    this.resultado = resultado;
    this.passos = passos;
  }

  registrarPasso(nome, status, detalhe) {
    this.passos.push({ nome, status, detalhe });
  }

  concluir(resultado) {
    this.status = STATUS.CONCLUIDA;
    this.resultado = resultado;
  }

  falhar(resultado) {
    this.status = STATUS.FALHA;
    this.resultado = resultado;
  }
}

Saga.STATUS = STATUS;

export default Saga;
