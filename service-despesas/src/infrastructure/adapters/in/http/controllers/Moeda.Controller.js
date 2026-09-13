class MoedaController {
  constructor(listarMoedasQuery) {
    this.listarMoedasQuery = listarMoedasQuery;
  }

  async listar(req, res, next) {
    try {
      const moedas = await this.listarMoedasQuery.execute();
      return res.status(200).json(moedas);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = MoedaController;   