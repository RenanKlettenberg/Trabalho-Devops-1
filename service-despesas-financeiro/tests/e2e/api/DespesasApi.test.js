import request from 'supertest';
import { app } from '../../../src/main.js'; // A instância do seu servidor Express/Fastify

describe('E2E: API REST de Despesas e Dashboard', () => {
  
  it('POST /api/despesas - deve registrar uma nova despesa e retornar 201 Created', async () => {
    const payload = {
      descricao: 'Passagem Aérea',
      valor: 1500.0,
      moeda: 'BRL',
      categoria: 'TRANSPORTE',
      viagemId: 'viagem-123'
    };

    const response = await request(app)
      .post('/api/despesas')
      .send(payload)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('ATIVA');
  });

  it('GET /api/viagens/:id/dashboard - deve retornar o resumo financeiro consolidado', async () => {
    const response = await request(app)
      .get('/api/viagens/viagem-123/dashboard?moeda=BRL')
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total');
    expect(response.body.moedaBase).toBe('BRL');
  });
});