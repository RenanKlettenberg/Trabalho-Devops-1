import Router from 'express';

//ARQUIVOS DE ROTAS:
import viagemRoutes from './routes/viagem.routes.js';

const router = Router();

//DEFINIÇÃO DAS ROTAS
router.use('/viagem', viagemRoutes);

export default router;