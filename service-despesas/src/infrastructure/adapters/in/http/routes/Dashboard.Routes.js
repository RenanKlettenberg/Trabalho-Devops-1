import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

function dashboardRoutes(dashboardController) {
  const router = Router();

  router.use(authMiddleware);

  router.get('/:viagemId', dashboardController.obterPorViagem);

  return router;
}

export { dashboardRoutes };
export default dashboardRoutes;
