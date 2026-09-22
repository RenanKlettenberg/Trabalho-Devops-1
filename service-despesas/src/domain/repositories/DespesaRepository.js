/**
 * Port (interface) do repositório de Despesa. Implementações concretas
 * ficam em infrastructure/adapters/out/database.
 */
class DespesaRepository {
  async salvar(_despesa) {
    throw new Error('DespesaRepository.salvar não implementado');
  }

  async buscarPorId(_id) {
    throw new Error('DespesaRepository.buscarPorId não implementado');
  }

  async buscarPorViagemId(_viagemId) {
    throw new Error('DespesaRepository.buscarPorViagemId não implementado');
  }

  async buscarPorEventoId(_eventoId) {
    throw new Error('DespesaRepository.buscarPorEventoId não implementado');
  }
}

export { DespesaRepository };
export default DespesaRepository;
