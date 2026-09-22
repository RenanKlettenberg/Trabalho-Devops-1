import crypto from 'crypto';
import Categoria from './Categoria.js';
import Moeda from './Moeda.js';
import {
  ValorInvalidoException,
  ViagemObrigatoriaException,
  DespesaJaEstornadaException,
} from '../exceptions/DomainExceptions.js';

const STATUS = Object.freeze({
  ATIVA: 'ATIVA',
  ESTORNADA: 'ESTORNADA',
});

class Despesa {
  constructor({
    id,
    descricao = '',
    valor,
    moeda,
    categoria,
    viagemId,
    eventoId = null,
    status = STATUS.ATIVA,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    const valorNumerico = Number(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      throw new ValorInvalidoException(valor);
    }

    if (!viagemId) {
      throw new ViagemObrigatoriaException();
    }

    this.id = id ?? crypto.randomUUID();
    this.descricao = String(descricao ?? '').trim();
    this.valor = valorNumerico;
    this.moeda = moeda instanceof Moeda ? moeda : new Moeda(moeda);
    this.categoria = categoria instanceof Categoria ? categoria : new Categoria(categoria);
    this.viagemId = String(viagemId);
    this.eventoId = eventoId ? String(eventoId) : null;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  estaAtiva() {
    return this.status === STATUS.ATIVA;
  }

  estornar() {
    if (!this.estaAtiva()) {
      throw new DespesaJaEstornadaException(this.id);
    }

    this.status = STATUS.ESTORNADA;
    this.updatedAt = new Date();
  }

  static registrar({ descricao, valor, moeda, categoria, viagemId, eventoId }) {
    return new Despesa({ descricao, valor, moeda, categoria, viagemId, eventoId });
  }
}

export { Despesa, STATUS as STATUS_DESPESA };
export default Despesa;
