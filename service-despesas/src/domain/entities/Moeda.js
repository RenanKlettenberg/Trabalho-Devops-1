import { MoedaInvalidaException } from '../exceptions/DomainExceptions.js';

const PADRAO_ISO_4217 = /^[A-Z]{3}$/;

class Moeda {
  #codigo;

  constructor(codigo) {
    const normalizado = String(codigo ?? '').trim().toUpperCase();

    if (!PADRAO_ISO_4217.test(normalizado)) {
      throw new MoedaInvalidaException(codigo);
    }

    this.#codigo = normalizado;
  }

  get codigo() {
    return this.#codigo;
  }

  equals(outra) {
    return outra instanceof Moeda && outra.codigo === this.#codigo;
  }

  toString() {
    return this.#codigo;
  }
}

export { Moeda };
export default Moeda;
