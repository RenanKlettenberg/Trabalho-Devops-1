import { jest } from '@jest/globals';
import errorMiddleware from '../../../../src/infrastructure/adapters/in/http/middlewares/error.middleware.js';
import AppError from '../../../../src/infrastructure/exceptions/AppError.js';
import { ValorInvalidoException, DespesaJaEstornadaException } from '../../../../src/domain/exceptions/DomainExceptions.js';

function criarResMock() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorMiddleware', () => {
  let res;
  const req = {};
  const next = jest.fn();

  beforeEach(() => {
    res = criarResMock();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('responde com o statusCode de um AppError', () => {
    errorMiddleware(new AppError('não autorizado', 401), req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'não autorizado' });
  });

  it('mapeia DomainException para o status correto usando o código', () => {
    errorMiddleware(new ValorInvalidoException(-1), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    res = criarResMock();
    errorMiddleware(new DespesaJaEstornadaException('id-1'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('responde 500 para erros inesperados sem vazar detalhes internos', () => {
    errorMiddleware(new Error('falha de conexão com o banco'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Erro interno do servidor' });
  });
});
