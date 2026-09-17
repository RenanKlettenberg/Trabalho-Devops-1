import { Router } from 'express';
import controller from '../modules/despesaParticipante.module.js';
import authMiddleware from '../infrastructure/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/despesa/:desId', controller.listarPorDespesa);
router.post('/', controller.criarVinculo);
router.delete('/:id', controller.deletarVinculo);

export default router;
