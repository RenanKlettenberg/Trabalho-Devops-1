export class DespesaRepository {
  async salvar(despesa) {
    void despesa;
    throw new Error('Método salvar deve ser implementado pelo adaptador');
  }

  async buscarPorViagem(viagemId) {
    void viagemId;
    throw new Error('Método buscarPorViagem deve ser implementado pelo adaptador');
  }

  async buscarPorEventoId(eventoId) {
    void eventoId;
    throw new Error('Método buscarPorEventoId deve ser implementado pelo adaptador');
  }

  async atualizarEmLote(despesas) {
    void despesas;
    throw new Error('Método atualizarEmLote deve ser implementado pelo adaptador');
  }
}

export default DespesaRepository;
