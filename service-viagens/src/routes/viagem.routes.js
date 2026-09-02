import Router from 'express';
import controller from '../modules/viagem.module.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.getById);
router.post('/', controller.criarViagem);
router.put('/:id', controller.editarViagem);
router.delete('/:id', controller.deletarViagem);

export default router;