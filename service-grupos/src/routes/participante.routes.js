import Router from 'express';
import controller from '../modules/participante.module.js';
import authMiddleware from '../infrastructure/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware); // todas as rotas abaixo exigem um JWT válido

router.get('/grupo/:gruId', controller.listarPorGrupo);
router.get('/:id', controller.getById);
router.post('/', controller.criarParticipante);
router.put('/:id', controller.editarParticipante);
router.delete('/:id', controller.deletarParticipante);

export default router;
