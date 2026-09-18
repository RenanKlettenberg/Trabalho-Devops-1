import Router from 'express';
import controller from '../modules/evento.module.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.getById);
router.post('/', controller.criarEvento);
router.put('/:id', controller.editarEvento);
router.delete('/:id', controller.deletarEvento);

export default router;