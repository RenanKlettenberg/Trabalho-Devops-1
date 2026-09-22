import { CategoriaInvalidaException } from '../exceptions/DomainExceptions.js';

const VALORES = Object.freeze([
  'ALIMENTACAO',
  'TRANSPORTE',
  'HOSPEDAGEM',
  'LAZER',
  'COMPRAS',
  'SAUDE',
  'OUTROS',
]);

class Categoria {
  #valor;

  constructor(valor) {
    const normalizado = String(valor ?? '').trim().toUpperCase();

    if (!VALORES.includes(normalizado)) {
      throw new CategoriaInvalidaException(valor);
    }

    this.#valor = normalizado;
  }

  get valor() {
    return this.#valor;
  }

  equals(outra) {
    return outra instanceof Categoria && outra.valor === this.#valor;
  }

  toString() {
    return this.#valor;
  }

  static listar() {
    return [...VALORES];
  }
}

export { Categoria, VALORES as CATEGORIAS_VALIDAS };
export default Categoria;
