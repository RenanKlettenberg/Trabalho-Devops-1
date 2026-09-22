class DashboardController {
  constructor({ obterDashboardFinanceiroQuery }) {
    this.obterDashboardFinanceiroQuery = obterDashboardFinanceiroQuery;
  }

  obterPorViagem = async (req, res, next) => {
    try {
      const { viagemId } = req.params;
      const { moedaPrincipal } = req.query;

      const dashboard = await this.obterDashboardFinanceiroQuery.executar({ viagemId, moedaPrincipal });

      return res.status(200).json(dashboard);
    } catch (error) {
      return next(error);
    }
  };
}

export { DashboardController };
export default DashboardController;
