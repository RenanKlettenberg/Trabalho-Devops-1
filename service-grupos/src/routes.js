import { Router } from 'express';
import participanteRoutes from './routes/participante.routes.js';
import grupoRoutes from './routes/grupo.routes.js';
import despesaParticipanteRoutes from './routes/despesaParticipante.routes.js';
import divisaoRoutes from './routes/divisao.routes.js';

const router = Router();

router.use('/participante', participanteRoutes);
router.use('/grupo', grupoRoutes);
router.use('/despesa-participante', despesaParticipanteRoutes);
router.use('/grupo/:gruId/despesa/:desId/divisao', divisaoRoutes);

router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'service-grupos' });
});

export default router;
