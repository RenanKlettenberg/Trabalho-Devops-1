import { validarToken } from '../config/jwt.js';
import AppError from '../exceptions/AppError.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticação não fornecido.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = validarToken(token);
    
    // Anexa as informações do usuário logado na requisição para uso nos controllers
    req.usuarioLogado = payload;
    
    next();
  } catch (error) {
    next(new AppError('Token inválido ou expirado.', 401));
  }
};

export default authMiddleware;