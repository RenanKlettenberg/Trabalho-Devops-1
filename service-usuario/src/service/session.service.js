import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import RESPONSE from "../shared/constants/response.js";
import AppError from "../infrastructure/errors/app.error.js";
import configJwt from '../infrastructure/config/jwt.js';
import pepperConfig from '../infrastructure/config/pepper.js';

function criarServiceSession(usuarioService) {
    async function login(dados) {
        const usuario = (await usuarioService.getByEmail(dados.usu_email))
        if (usuario.rowCount == 0) {
            throw new AppError(RESPONSE.CREDENCIAIS_INVALIDAS);
        }

        const senha = dados.usu_password + pepperConfig.secret;
        const senhaValida = await bcrypt.compare(senha, usuario.rows[0].usu_password);

        if (!senhaValida) {
            throw new AppError(RESPONSE.CREDENCIAIS_INVALIDAS);
        }

        return assinarToken(usuario.rows[0]);
    }

    function assinarToken(payload) {
        delete payload.usu_password;
        const token = jwt.sign(payload, configJwt.secret, configJwt.options)
        return { ...payload, jwt: token };
    }

    return { login };
}

export default criarServiceSession;