import Router from 'express';

//ARQUIVOS DE ROTAS:
import viagemRoutes from './routes/viagem.routes.js';
import eventoRoutes from './routes/evento.routes.js';

const router = Router();

//DEFINIÇÃO DAS ROTAS
router.use('/viagem', viagemRoutes);
router.use('/evento', eventoRoutes);

export default router;