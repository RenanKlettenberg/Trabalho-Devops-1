import express from 'express';

// Montada em /api/viagens -> GET /api/viagens/:viagemId/dashboard?moeda=BRL
export default (dashboardController) => {
  const router = express.Router();

  router.get('/:viagemId/dashboard', (req, res, next) => dashboardController.obterResumo(req, res, next));

  return router;
};
