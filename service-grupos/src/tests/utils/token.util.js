import jwt from 'jsonwebtoken';
import jwtConfig from '../../infrastructure/config/jwt.js';

// Reaproveita jwtConfig (mesma leitura de secret que o server usa) pra garantir
// que o token gerado aqui é validado pelo servidor rodando em paralelo.
function gerarToken(payload) {
    return jwt.sign(payload, jwtConfig.secret);
}

export default gerarToken;
