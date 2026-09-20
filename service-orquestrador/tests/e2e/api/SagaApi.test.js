import { jest } from '@jest/globals';
import request from 'supertest';
import createApp from '../../../src/infrastructure/app.js';
import PostgresSagaRepository from '../../../src/infrastructure/adapters/out/database/PostgresSagaRepository.js';
import database from '../../../src/infrastructure/config/database.js';

describe('E2E: API de sagas', () => {
  let app;
  let mockRpcClient;
  const sagaRepository = new PostgresSagaRepository();

  beforeEach(() => {
    mockRpcClient = { requisitar: jest.fn() };
    app = createApp({ rpcClient: mockRpcClient, sagaRepository });
  });

  afterEach(async () => {
    await database.query('TRUNCATE orquestrador.saga_passos, orquestrador.sagas;');
  });

  afterAll(async () => {
    await database.pool.end();
  });

  it('POST /api/sagas/despesas deve retornar 201 quando service-despesas confirma o registro', async () => {
    mockRpcClient.requisitar.mockResolvedValue({
      status: 'SUCESSO',
      evento: 'DESPESA_REGISTRADA',
      despesaId: 'd-1'
    });

    const resposta = await request(app).post('/api/sagas/despesas').send({
      descricao: 'Táxi',
      valor: 50,
      moeda: 'BRL',
      categoria: 'TRANSPORTE',
      viagemId: 'v-1'
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.status).toBe('CONCLUIDA');
    expect(resposta.body.resultado.despesaId).toBe('d-1');
  });

  it('POST /api/sagas/despesas deve retornar 422 quando service-despesas recusa o registro', async () => {
    mockRpcClient.requisitar.mockResolvedValue({ status: 'FALHA', evento: 'ERRO_VALIDACAO' });

    const resposta = await request(app).post('/api/sagas/despesas').send({
      descricao: 'Táxi',
      valor: -50,
      moeda: 'BRL',
      categoria: 'TRANSPORTE',
      viagemId: 'v-1'
    });

    expect(resposta.status).toBe(422);
    expect(resposta.body.status).toBe('FALHA');
  });

  it('GET /api/sagas/:id deve retornar a saga previamente persistida', async () => {
    mockRpcClient.requisitar.mockResolvedValue({
      status: 'SUCESSO',
      evento: 'DESPESA_REGISTRADA',
      despesaId: 'd-2'
    });

    const criada = await request(app).post('/api/sagas/despesas').send({
      descricao: 'Hotel',
      valor: 300,
      moeda: 'BRL',
      categoria: 'HOSPEDAGEM',
      viagemId: 'v-2'
    });

    const consultada = await request(app).get(`/api/sagas/${criada.body.id}`);

    expect(consultada.status).toBe(200);
    expect(consultada.body.sag_id).toBe(criada.body.id);
    expect(consultada.body.passos).toHaveLength(1);
  });

  it('GET /api/sagas/:id deve retornar 404 quando a saga não existe', async () => {
    const resposta = await request(app).get('/api/sagas/00000000-0000-0000-0000-000000000000');

    expect(resposta.status).toBe(404);
  });

  it('POST /api/sagas/despesas/:eventoId/cancelar deve retornar 200 quando a compensação é confirmada', async () => {
    mockRpcClient.requisitar.mockResolvedValue({ status: 'SUCESSO', evento: 'DESPESAS_COMPENSADAS' });

    const resposta = await request(app).post('/api/sagas/despesas/evento-505/cancelar');

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('CONCLUIDA');
  });
});
