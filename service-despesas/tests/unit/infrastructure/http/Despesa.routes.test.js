import request from 'supertest';
import jwt from 'jsonwebtoken';
import createApp from '../../../../src/infrastructure/app.js';
import criarFakeDespesaRepository from '../../../setup/fakeDespesaRepository.js';
import { CATEGORIAS_VALIDAS } from '../../../../src/domain/entities/Categoria.js';

const token = jwt.sign({ usu_id: 1 }, process.env.SECRET_JWT);
const auth = { Authorization: `Bearer ${token}` };

function criarApp() {
  const despesaRepository = criarFakeDespesaRepository();
  const exchangeRateProvider = { obterTaxa: async () => 1 };
  const app = createApp({ despesaRepository, exchangeRateProvider });
  return { app, despesaRepository };
}

describe('rotas /api/despesas', () => {
  it('exige autenticação', async () => {
    const { app } = criarApp();
    const res = await request(app).get('/api/despesas/categorias');
    expect(res.status).toBe(401);
  });

  it('rejeita token inválido', async () => {
    const { app } = criarApp();
    const res = await request(app)
      .get('/api/despesas/categorias')
      .set('Authorization', 'Bearer token-invalido');
    expect(res.status).toBe(401);
  });

  it('lista as categorias válidas', async () => {
    const { app } = criarApp();
    const res = await request(app).get('/api/despesas/categorias').set(auth);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(CATEGORIAS_VALIDAS);
  });

  it('registra uma despesa e retorna 201', async () => {
    const { app } = criarApp();
    const res = await request(app).post('/api/despesas').set(auth).send({
      descricao: 'Passeio de barco',
      valor: 150,
      moeda: 'EUR',
      categoria: 'LAZER',
      viagemId: 'v1',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      descricao: 'Passeio de barco',
      valor: 150,
      moeda: 'EUR',
      categoria: 'LAZER',
      viagemId: 'v1',
      status: 'ATIVA',
    });
  });

  it('retorna 400 com o código do erro de domínio ao registrar dados inválidos', async () => {
    const { app } = criarApp();
    const res = await request(app).post('/api/despesas').set(auth).send({
      valor: -5,
      moeda: 'EUR',
      categoria: 'LAZER',
      viagemId: 'v1',
    });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe('VALOR_INVALIDO');
  });

  it('retorna 400 ao registrar despesa sem viagemId', async () => {
    const { app } = criarApp();
    const res = await request(app).post('/api/despesas').set(auth).send({
      valor: 10,
      moeda: 'EUR',
      categoria: 'LAZER',
    });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe('VIAGEM_OBRIGATORIA');
  });

  it('estorna uma despesa e bloqueia um segundo estorno', async () => {
    const { app } = criarApp();
    const criada = await request(app).post('/api/despesas').set(auth).send({
      valor: 10, moeda: 'BRL', categoria: 'OUTROS', viagemId: 'v1',
    });

    const primeiroEstorno = await request(app).delete(`/api/despesas/${criada.body.id}`).set(auth);
    expect(primeiroEstorno.status).toBe(200);
    expect(primeiroEstorno.body.status).toBe('ESTORNADA');

    const segundoEstorno = await request(app).delete(`/api/despesas/${criada.body.id}`).set(auth);
    expect(segundoEstorno.status).toBe(409);
    expect(segundoEstorno.body.codigo).toBe('DESPESA_JA_ESTORNADA');
  });
});
