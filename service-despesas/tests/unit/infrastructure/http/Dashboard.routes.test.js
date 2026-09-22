import request from 'supertest';
import jwt from 'jsonwebtoken';
import createApp from '../../../../src/infrastructure/app.js';
import Despesa from '../../../../src/domain/entities/Despesa.js';
import criarFakeDespesaRepository from '../../../setup/fakeDespesaRepository.js';

const token = jwt.sign({ usu_id: 1 }, process.env.SECRET_JWT);
const auth = { Authorization: `Bearer ${token}` };

describe('rotas /api/dashboard', () => {
  it('exige autenticação', async () => {
    const despesaRepository = criarFakeDespesaRepository();
    const app = createApp({ despesaRepository, exchangeRateProvider: { obterTaxa: async () => 1 } });

    const res = await request(app).get('/api/dashboard/v1');
    expect(res.status).toBe(401);
  });

  it('retorna o total consolidado convertido para a moeda principal', async () => {
    const despesaRepository = criarFakeDespesaRepository();
    await despesaRepository.salvar(
      Despesa.registrar({ valor: 100, moeda: 'USD', categoria: 'HOSPEDAGEM', viagemId: 'v1' })
    );

    const exchangeRateProvider = { obterTaxa: async (origem, destino) => (origem === destino ? 1 : 5) };
    const app = createApp({ despesaRepository, exchangeRateProvider });

    const res = await request(app).get('/api/dashboard/v1?moedaPrincipal=BRL').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.moedaPrincipal).toBe('BRL');
    expect(res.body.totalGeral).toBe(500);
    expect(res.body.totalPorCategoria).toEqual({ HOSPEDAGEM: 500 });
  });
});
