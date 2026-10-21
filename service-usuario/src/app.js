import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import client from 'prom-client';
import errorMiddleware from './infrastructure/middlewares/error.middleware.js';

const app = express();

const register = new client.Registry();

client.collectDefaultMetrics({ register });

app.use(cors());
app.use(express.json());

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end('Erro ao gerar métricas');
  }
});

app.use('/api/v1', routes);
app.use(errorMiddleware);

export default app;