class DashboardController {
  constructor(obterDashboardFinanceiroQuery) {
    this.obterDashboardFinanceiroQuery = obterDashboardFinanceiroQuery;
  }

  async obterResumo(req, res, next) {
    try {
      const { viagemId } = req.params;
      const { moeda } = req.query;

      const resultado = await this.obterDashboardFinanceiroQuery.execute({
        viagemId,
        moedaDestino: moeda
      });

      return res.status(200).json({
        moedaBase: moeda,
        total: resultado.total
      });
    } catch (error) {
      next(error);
    }
  }
}

export { DashboardController };
export default DashboardController;
