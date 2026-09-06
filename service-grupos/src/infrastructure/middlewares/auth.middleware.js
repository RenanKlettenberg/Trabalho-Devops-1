import jwt from 'jsonwebtoken';
import AppError from '../errors/app.error.js';
import RESPONSE from '../../shared/constants/response.js';
import jwtConfig from '../config/jwt.js';
import { PLANO_PADRAO } from '../../shared/constants/planos.js';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError(RESPONSE.USUARIO_NAO_LOGADO);
    }

    const [, token] = authHeader.split(' '); // formato esperado: "Bearer <token>"

    if (!token) {
        throw new AppError(RESPONSE.USUARIO_NAO_LOGADO);
    }

    try {
        const payload = jwt.verify(token, jwtConfig.secret);

        req.usuario = {
            ...payload,
            usu_plano: payload.usu_plano  ?? PLANO_PADRAO
        };

        next();
    } catch (error) {
        throw new AppError(RESPONSE.TOKEN_INVALIDO);
    }
}

export default authMiddleware;
