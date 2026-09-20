import Router from 'express';
import controller from '../modules/usuario.module.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.getById);
router.post('/', controller.criarUsuario);
router.put('/:id', controller.editarUsuario);
router.delete('/:id', controller.deletarUsuario);

export default router;