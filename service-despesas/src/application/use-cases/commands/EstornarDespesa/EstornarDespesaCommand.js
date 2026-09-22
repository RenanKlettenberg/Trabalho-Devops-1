import { DespesaNaoEncontradaException } from '../../../../domain/exceptions/DomainExceptions.js';

/**
 * Estorno manual de uma única despesa por id (via HTTP), diferente de
 * CompensarDespesaCommand, que estorna em lote por eventoId/viagemId
 * (usado pela SAGA de cancelamento).
 */
class EstornarDespesaCommand {
  constructor(despesaRepository) {
    this.despesaRepository = despesaRepository;
  }

  async executar(id) {
    const despesa = await this.despesaRepository.buscarPorId(id);

    if (!despesa) {
      throw new DespesaNaoEncontradaException(id);
    }

    despesa.estornar();
    await this.despesaRepository.salvar(despesa);

    return despesa;
  }
}

export { EstornarDespesaCommand };
export default EstornarDespesaCommand;
