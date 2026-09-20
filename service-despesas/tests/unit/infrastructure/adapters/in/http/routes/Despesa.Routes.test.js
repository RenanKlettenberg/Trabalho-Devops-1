import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import despesaRoutes from '../../../../../../../src/infrastructure/adapters/in/http/routes/Despesa.Routes.js';

function criarApp(mockCommand, mockQuery) {
  const app = express();
  app.use(express.json());
  app.use('/api/despesas', despesaRoutes(mockCommand, mockQuery));
  return app;
}

describe('Rotas: Despesa', () => {
  it('POST /api/despesas deve chamar o command e retornar 201', async () => {
    const mockCommand = { execute: jest.fn().mockResolvedValue({ id: 'd-1', status: 'ATIVA' }) };
    const app = criarApp(mockCommand, {});

    const response = await request(app)
      .post('/api/despesas')
      .send({ valor: 50, descricao: 'Táxi', categoria: 'TRANSPORTE', moeda: 'BRL', viagemId: 'v-1' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'd-1', status: 'ATIVA' });
    expect(mockCommand.execute).toHaveBeenCalledTimes(1);
  });

  it('GET /api/despesas/:id deve chamar a query e retornar 200 quando encontrada', async () => {
    const mockQuery = { execute: jest.fn().mockResolvedValue({ id: 'd-1', descricao: 'Táxi' }) };
    const app = criarApp({}, mockQuery);

    const response = await request(app).get('/api/despesas/d-1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'd-1', descricao: 'Táxi' });
    expect(mockQuery.execute).toHaveBeenCalledWith('d-1');
  });

  it('GET /api/despesas/:id deve retornar 404 quando a despesa não existe', async () => {
    const mockQuery = { execute: jest.fn().mockResolvedValue(null) };
    const app = criarApp({}, mockQuery);

    const response = await request(app).get('/api/despesas/inexistente');

    expect(response.status).toBe(404);
  });
});
