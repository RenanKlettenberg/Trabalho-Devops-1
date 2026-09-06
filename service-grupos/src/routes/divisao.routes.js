import Router from 'express';
import controller from '../modules/divisao.module.js';
import authMiddleware from '../infrastructure/middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', controller.calcularDivisaoDespesa);

export default router;
