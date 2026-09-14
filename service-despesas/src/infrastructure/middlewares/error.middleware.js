import AppError from '../exceptions/AppError.js';

function errorMiddleware(err, req, res, next) {
  // Se for um erro que nós criamos (AppError, DomainException, etc)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Se for um erro inesperado (banco caiu, syntax error, etc)
  console.error('ERRO INTERNO:', err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor'
  });
}

export { errorMiddleware };
export default errorMiddleware;