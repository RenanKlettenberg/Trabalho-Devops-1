import { DespesaNaoEncontradaException } from '../../../../domain/exceptions/DomainExceptions.js';

class ObterDespesaQuery {
  constructor(despesaRepository) {
    this.despesaRepository = despesaRepository;
  }

  async executar(id) {
    const despesa = await this.despesaRepository.buscarPorId(id);

    if (!despesa) {
      throw new DespesaNaoEncontradaException(id);
    }

    return despesa;
  }
}

export { ObterDespesaQuery };
export default ObterDespesaQuery;
