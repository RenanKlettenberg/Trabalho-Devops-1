import Router from 'express';
import controller from '../modules/session.module.js';

const router = Router();

router.post('/', controller.login);

router.delete('/', controller.logoff);

export default router;