import request from 'supertest';
import createApp from '../../../../src/infrastructure/app.js';
import criarFakeDespesaRepository from '../../../setup/fakeDespesaRepository.js';

function criarApp() {
  const despesaRepository = criarFakeDespesaRepository();
  return createApp({ despesaRepository, exchangeRateProvider: { obterTaxa: async () => 1 } });
}

describe('documentação da API', () => {
  it('serve a especificação OpenAPI sem exigir autenticação', async () => {
    const res = await request(criarApp()).get('/api-docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining([
        '/api/despesas',
        '/api/despesas/categorias',
        '/api/despesas/viagem/{viagemId}',
        '/api/despesas/{id}',
        '/api/dashboard/{viagemId}',
      ])
    );
  });

  it('serve o Swagger UI em /api-docs', async () => {
    const res = await request(criarApp()).get('/api-docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
