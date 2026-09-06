import Router from 'express';
import controller from '../modules/grupo.module.js';
import authMiddleware from '../infrastructure/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', controller.listarMeusGrupos);
router.get('/:id', controller.getById);
router.post('/', controller.criarGrupo);
router.put('/:id', controller.editarGrupo);
router.delete('/:id', controller.deletarGrupo);

export default router;
