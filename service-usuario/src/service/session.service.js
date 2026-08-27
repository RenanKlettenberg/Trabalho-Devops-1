import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import RESPONSE from "../shared/constants/response.js";
import AppError from "../infrastructure/errors/app.error.js";
import configJwt from '../infrastructure/config/jwt.js';

function criarServiceSession(usuarioService, roleService) {
    async function login(dados) {
        const usuario = (await usuarioService.getByEmail(dados.usu_email)).rows[0]
        if (usuario.rowCount == 0) {
            throw new AppError(RESPONSE.CREDENCIAIS_INVALIDAS);
        }

        const SECRET = process.env.SECRET;
        const senha = dados.usu_password + SECRET;
        const senhaValida = await bcrypt.compare(senha, usuario.usu_password);

        if (!senhaValida) {
            throw new AppError(RESPONSE.CREDENCIAIS_INVALIDAS);
        }

        const permissions = await roleService.getPermissions(usuario);
        usuario.permissions = permissions;
        return assinarToken(usuario);
    }

    async function logoff(dados) {
        await clearPermissions(dados.usu_id);
    }

    function assinarToken(payload) {
        delete payload.usu_password;
        const token = jwt.sign(payload, configJwt.secret, configJwt.options)
        return { ...payload, jwt: token };
    }

    async function clearPermissions(usu_id) {
        const key = `user:${usu_id}:permissions`;
        await cacher.del(key);
    }

    return { login, logoff };
}

export default criarServiceSession;