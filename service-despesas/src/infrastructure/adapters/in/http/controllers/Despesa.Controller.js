class DespesaController {
  constructor(criarDespesaCommand, obterDespesaQuery) {
    // Injeção de dependência dos Commands/Queries da Camada de Aplicação
    this.criarDespesaCommand = criarDespesaCommand;
    this.obterDespesaQuery = obterDespesaQuery;
  }

  async criar(req, res) {
    try {
      // 1. Extrai dados do mundo externo (HTTP)
      const { valor, descricao, categoria, moeda, viagemId, eventoId } = req.body;

      // 2. Chama a linguagem da Camada de Aplicação (Command)
      const resultado = await this.criarDespesaCommand.execute({
        valor,
        descricao,
        categoria,
        moeda,
        viagemId,
        eventoId
      });

      // 3. Traduz a resposta para o mundo externo
      return res.status(201).json(resultado);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const despesa = await this.obterDespesaQuery.execute(id);
      
      if (!despesa) {
        return res.status(404).json({ mensagem: 'Despesa não encontrada' });
      }

      return res.status(200).json(despesa);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
}

export { DespesaController };
export default DespesaController;