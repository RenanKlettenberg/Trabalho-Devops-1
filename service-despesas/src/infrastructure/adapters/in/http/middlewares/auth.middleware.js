import jwt from 'jsonwebtoken';
import AppError from '../../../../exceptions/AppError.js';
import jwtConfig from '../../../../config/jwt.js';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Usuário não autenticado.', 401));
  }

  const [, token] = authHeader.split(' '); // formato esperado: "Bearer <token>"

  if (!token) {
    return next(new AppError('Usuário não autenticado.', 401));
  }

  try {
    req.usuario = jwt.verify(token, jwtConfig.secret);
    next();
  } catch (error) {
    next(new AppError('Token inválido ou expirado.', 401));
  }
}

export { authMiddleware };
export default authMiddleware;
