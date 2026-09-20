import { jest } from '@jest/globals';
import { DashboardController } from '../../../../../../../src/infrastructure/adapters/in/http/controllers/Dashboard.Controller.js';

function criarResposta() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Controller: Dashboard', () => {
  it('deve retornar 200 com o total e a moeda base solicitada', async () => {
    const mockQuery = { execute: jest.fn().mockResolvedValue({ total: 150.5 }) };
    const controller = new DashboardController(mockQuery);

    const req = { params: { viagemId: 'viagem-123' }, query: { moeda: 'BRL' } };
    const res = criarResposta();
    const next = jest.fn();

    await controller.obterResumo(req, res, next);

    expect(mockQuery.execute).toHaveBeenCalledWith({ viagemId: 'viagem-123', moedaDestino: 'BRL' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ moedaBase: 'BRL', total: 150.5 });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve repassar o erro para o middleware de erro via next()', async () => {
    const erro = new Error('Serviço de câmbio indisponível');
    const mockQuery = { execute: jest.fn().mockRejectedValue(erro) };
    const controller = new DashboardController(mockQuery);

    const req = { params: { viagemId: 'viagem-123' }, query: { moeda: 'BRL' } };
    const res = criarResposta();
    const next = jest.fn();

    await controller.obterResumo(req, res, next);

    expect(next).toHaveBeenCalledWith(erro);
    expect(res.status).not.toHaveBeenCalled();
  });
});
