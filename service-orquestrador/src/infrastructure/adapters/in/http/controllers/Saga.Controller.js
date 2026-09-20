class SagaController {
  constructor(registrarDespesaSaga, cancelarDespesaSaga, sagaRepository) {
    // Injeção de dependência das sagas da Camada de Aplicação
    this.registrarDespesaSaga = registrarDespesaSaga;
    this.cancelarDespesaSaga = cancelarDespesaSaga;
    this.sagaRepository = sagaRepository;
  }

  async registrarDespesa(req, res) {
    try {
      const { descricao, valor, moeda, categoria, viagemId } = req.body;

      const saga = await this.registrarDespesaSaga.execute({
        descricao,
        valor,
        moeda,
        categoria,
        viagemId
      });

      return res.status(saga.status === 'CONCLUIDA' ? 201 : 422).json(saga);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async cancelarDespesa(req, res) {
    try {
      const { eventoId } = req.params;

      const saga = await this.cancelarDespesaSaga.execute({ eventoId });

      return res.status(saga.status === 'CONCLUIDA' ? 200 : 422).json(saga);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const saga = await this.sagaRepository.buscarPorId(id);

      if (!saga) {
        return res.status(404).json({ mensagem: 'Saga não encontrada' });
      }

      return res.status(200).json(saga);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
}

export { SagaController };
export default SagaController;
