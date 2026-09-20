export class ObterDespesaQuery {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(id) {
    return this.repository.buscarPorId(id);
  }
}

export default ObterDespesaQuery;
