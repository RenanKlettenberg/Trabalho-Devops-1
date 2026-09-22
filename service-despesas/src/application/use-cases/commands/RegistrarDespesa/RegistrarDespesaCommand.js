import Despesa from '../../../../domain/entities/Despesa.js';

/**
 * Requisito 1: registra uma despesa (manual ou originada de um evento),
 * com suporte a diferentes moedas e categorias.
 */
class RegistrarDespesaCommand {
  constructor(despesaRepository) {
    this.despesaRepository = despesaRepository;
  }

  async executar({ descricao, valor, moeda, categoria, viagemId, eventoId }) {
    const despesa = Despesa.registrar({ descricao, valor, moeda, categoria, viagemId, eventoId });

    await this.despesaRepository.salvar(despesa);

    return despesa;
  }
}

export { RegistrarDespesaCommand };
export default RegistrarDespesaCommand;
