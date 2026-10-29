import express from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';
import errorMiddleware from './adapters/in/http/middlewares/error.middleware.js';

import RegistrarDespesaCommand from '../application/use-cases/commands/RegistrarDespesa/RegistrarDespesaCommand.js';
import EstornarDespesaCommand from '../application/use-cases/commands/EstornarDespesa/EstornarDespesaCommand.js';
import ObterDespesaQuery from '../application/use-cases/queries/ObterDespesa/ObterDespesaQuery.js';
import ObterDashboardFinanceiroQuery from '../application/use-cases/queries/ObterDashboardFinanceiro/ObterDashboardFinanceiroQuery.js';

import DespesaController from './adapters/in/http/controllers/Despesa.Controller.js';
import DashboardController from './adapters/in/http/controllers/Dashboard.Controller.js';
import CategoriaController from './adapters/in/http/controllers/Categoria.Controller.js';

import despesaRoutes from './adapters/in/http/routes/Despesa.Routes.js';
import dashboardRoutes from './adapters/in/http/routes/Dashboard.Routes.js';

// Métricas do Prometheus expostas em GET /metrics. Criado uma vez só porque o
// prom-client usa um registro global: chamar promBundle() a cada createApp()
// (como nos testes) tentaria registrar as mesmas métricas de novo e quebraria.
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});

// Composição pura: recebe as dependências de I/O (repositório, provider de
// câmbio) já prontas, para poder ser testada com supertest sem tocar em
// banco/rede de verdade.
function createApp({ despesaRepository, exchangeRateProvider }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(metricsMiddleware);

  const registrarDespesaCommand = new RegistrarDespesaCommand(despesaRepository);
  const estornarDespesaCommand = new EstornarDespesaCommand(despesaRepository);
  const obterDespesaQuery = new ObterDespesaQuery(despesaRepository);
  const obterDashboardFinanceiroQuery = new ObterDashboardFinanceiroQuery(despesaRepository, exchangeRateProvider);

  const despesaController = new DespesaController({
    registrarDespesaCommand,
    obterDespesaQuery,
    estornarDespesaCommand,
    despesaRepository,
  });
  const dashboardController = new DashboardController({ obterDashboardFinanceiroQuery });
  const categoriaController = new CategoriaController();

  app.use('/api/despesas', despesaRoutes(despesaController, categoriaController));
  app.use('/api/dashboard', dashboardRoutes(dashboardController));

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  // Middleware de tratamento de erros (deve ser sempre o último 'use')
  app.use(errorMiddleware);

  return app;
}

export { createApp };
export default createApp;
