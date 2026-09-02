import Router from 'express';

//ARQUIVOS DE ROTAS:
import usuarioRoutes from './routes/usuario.routes.js';
import sessionRoutes from './routes/session.routes.js';

const router = Router();

//DEFINIÇÃO DAS ROTAS
router.use('/usuario', usuarioRoutes);
router.use('/session', sessionRoutes);

export default router;