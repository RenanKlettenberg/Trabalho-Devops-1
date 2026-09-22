import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';

function despesaRoutes(despesaController, categoriaController) {
  const router = Router();

  router.use(authMiddleware);

  router.post('/', despesaController.registrar);
  router.get('/categorias', categoriaController.listar);
  router.get('/viagem/:viagemId', despesaController.listarPorViagem);
  router.get('/:id', despesaController.obterPorId);
  router.delete('/:id', despesaController.estornar);

  return router;
}

export { despesaRoutes };
export default despesaRoutes;
