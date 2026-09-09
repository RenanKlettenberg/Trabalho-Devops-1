export class DespesaRepository {
  async salvar() {
    throw new Error('Método salvar deve ser implementado pelo adaptador');
  }

  async buscarPorEventoId() {
    throw new Error('Método buscarPorEventoId deve ser implementado pelo adaptador');
  }

  async atualizarEmLote() {
    throw new Error('Método atualizarEmLote deve ser implementado pelo adaptador');
  }
}

export default DespesaRepository;
