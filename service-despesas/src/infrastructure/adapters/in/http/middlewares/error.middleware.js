import AppError from '../../../../exceptions/AppError.js';
import { DomainException } from '../../../../../domain/exceptions/DomainExceptions.js';

const STATUS_POR_CODIGO = {
  VALOR_INVALIDO: 400,
  MOEDA_INVALIDA: 400,
  CATEGORIA_INVALIDA: 400,
  VIAGEM_OBRIGATORIA: 400,
  DESPESA_JA_ESTORNADA: 409,
  DESPESA_NAO_ENCONTRADA: 404,
};

function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof DomainException) {
    const statusCode = STATUS_POR_CODIGO[err.codigo] || 400;
    return res.status(statusCode).json({
      status: 'error',
      codigo: err.codigo,
      message: err.message,
    });
  }

  console.error('ERRO INTERNO:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
}

export { errorMiddleware };
export default errorMiddleware;
