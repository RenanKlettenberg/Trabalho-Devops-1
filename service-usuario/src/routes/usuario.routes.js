import Router from 'express';
import controller from '../modules/usuario.module.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.getById);
router.post('/', controller.criarUsuario);

export default router;