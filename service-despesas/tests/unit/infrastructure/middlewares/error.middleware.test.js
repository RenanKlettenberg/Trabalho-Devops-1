import { jest } from '@jest/globals';
import errorMiddleware from '../../../../src/infrastructure/middlewares/error.middleware.js';
import AppError from '../../../../src/infrastructure/exceptions/AppError.js';

function criarResposta() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('AppError', () => {
  it('deve usar 400 como statusCode padrão quando não informado', () => {
    const erro = new AppError('Requisição inválida');

    expect(erro.statusCode).toBe(400);
    expect(erro.isOperational).toBe(true);
  });
});

describe('Middleware: errorMiddleware', () => {
  it('deve responder com o statusCode e a mensagem de um AppError', () => {
    const erro = new AppError('Despesa inválida', 422);
    const res = criarResposta();

    errorMiddleware(erro, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Despesa inválida' });
  });

  it('deve responder 500 genérico para um erro inesperado, sem vazar a mensagem original', () => {
    const erro = new Error('conexão recusada em algum detalhe interno do banco');
    const res = criarResposta();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorMiddleware(erro, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Erro interno do servidor' });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
