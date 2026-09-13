class DashboardController {
  constructor(obterDashboardFinanceiroQuery) {
    this.obterDashboardFinanceiroQuery = obterDashboardFinanceiroQuery;
  }

  async obterResumo(req, res, next) {
    try {
      // Pode receber filtros via Query Params (ex: ?usuarioId=123&mes=09)
      const { usuarioId, grupoId, mes, ano } = req.query;

      const dashboard = await this.obterDashboardFinanceiroQuery.execute({
        usuarioId,
        grupoId,
        mes,
        ano
      });

      return res.status(200).json(dashboard);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;