import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';

import database from './config/database.js';
import PostgresDespesaRepository from './adapters/out/database/PostgresDespesaRepository.js';
import ExchangeRateApiAdapter from './adapters/out/external/exchange-api/ExchangeRateApiAdapter.js';

import RegistrarDespesaCommand from '../application/commands/RegistrarDespesa/RegistrarDespesaCommand.js';
import ObterDespesaQuery from '../application/queries/ObterDespesa/ObterDespesaQuery.js';
import ObterDashboardFinanceiroQuery from '../application/queries/ObterDashboardFinanceiro/ObterDashboardFinanceiroQuery.js';

import despesaRoutes from './adapters/in/http/routes/Despesa.Routes.js';
import dashboardRoutes from './adapters/in/http/routes/Dashboard.Routes.js';
import DashboardController from './adapters/in/http/controllers/Dashboard.Controller.js';

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Composição das dependências (repositório único: despesa pertence a uma viagem;
// a divisão entre participantes do grupo é responsabilidade do service-grupos)
const despesaRepository = new PostgresDespesaRepository(database);
const cambioRepository = new ExchangeRateApiAdapter();

const criarDespesaCommand = new RegistrarDespesaCommand(despesaRepository);
const obterDespesaQuery = new ObterDespesaQuery(despesaRepository);
const obterDashboardFinanceiroQuery = new ObterDashboardFinanceiroQuery(despesaRepository, cambioRepository);
const dashboardController = new DashboardController(obterDashboardFinanceiroQuery);

// Rotas
app.use('/api/despesas', despesaRoutes(criarDespesaCommand, obterDespesaQuery));
app.use('/api/viagens', dashboardRoutes(dashboardController));

// Middleware de tratamento de erros (deve ser sempre o último 'use')
app.use(errorMiddleware);

// Exportadas para o server.js poder ligar o consumer de mensageria (saga)
// reaproveitando as mesmas instâncias, sem duplicar a composição.
export { app, despesaRepository, criarDespesaCommand };
export default app;
