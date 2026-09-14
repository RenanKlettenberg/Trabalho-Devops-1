import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_seguro_desenvolvimento';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const jwtConfig = {
  gerarToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
  
  validarToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
};

export const { gerarToken, validarToken } = jwtConfig;
export default jwtConfig;