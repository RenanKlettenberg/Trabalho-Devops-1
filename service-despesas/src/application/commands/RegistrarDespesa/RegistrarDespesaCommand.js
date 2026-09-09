import Despesa from '../../../domain/entities/Despesa.js';

export class RegistrarDespesaCommand {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(input) {
    const despesa = input instanceof Despesa ? input : new Despesa(input);
    await this.repository.salvar(despesa);
    return despesa;
  }
}

export default RegistrarDespesaCommand;
