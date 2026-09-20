import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';

import RegistrarDespesaSaga from '../application/sagas/RegistrarDespesaSaga.js';
import CancelarDespesaSaga from '../application/sagas/CancelarDespesaSaga.js';

import sagaRoutes from './adapters/in/http/routes/Saga.Routes.js';

// Composição pura: recebe as dependências de I/O (rpcClient, sagaRepository)
// já prontas, para poder ser testada com supertest sem tocar em rede/RabbitMQ.
function createApp({ rpcClient, sagaRepository }) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const registrarDespesaSaga = new RegistrarDespesaSaga(rpcClient, sagaRepository);
  const cancelarDespesaSaga = new CancelarDespesaSaga(rpcClient, sagaRepository);

  app.use('/api/sagas', sagaRoutes(registrarDespesaSaga, cancelarDespesaSaga, sagaRepository));

  // Middleware de tratamento de erros (deve ser sempre o último 'use')
  app.use(errorMiddleware);

  return app;
}

export { createApp };
export default createApp;
