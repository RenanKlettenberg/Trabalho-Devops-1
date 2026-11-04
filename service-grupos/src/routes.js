import { Router } from 'express';
import { createRequire } from 'module';
import participanteRoutes from './routes/participante.routes.js';
import grupoRoutes from './routes/grupo.routes.js';
import despesaParticipanteRoutes from './routes/despesaParticipante.routes.js';
import divisaoRoutes from './routes/divisao.routes.js';

const router = Router();

// Versão do package.json (fallback para rodar local / nos testes)
const { version: versaoPackage } = createRequire(import.meta.url)('../package.json');

router.use('/participante', participanteRoutes);
router.use('/grupo', grupoRoutes);
router.use('/despesa-participante', despesaParticipanteRoutes);
router.use('/grupo/:gruId/despesa/:desId/divisao', divisaoRoutes);

router.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'service-grupos' });
});

// Mostra qual versão está no ar. APP_VERSION e APP_COMMIT são gravados na
// imagem pela pipeline (GitHub Actions) - ver Dockerfile e service-grupos.yml.
router.get('/version', (_req, res) => {
    res.json({
        service: 'service-grupos',
        version: process.env.APP_VERSION || versaoPackage,
        commit: process.env.APP_COMMIT || null,
    });
});

export default router;
