import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from "../infrastructure/errors/app.error.js";
import RESPONSE from "../shared/constants/response.js";
import configJwt from '../infrastructure/config/jwt.js';

function criarServiceUsuario(repository) {
    async function listar(req, res) {
        return await repository.listar();
    }

    async function getById(id) {
        return await repository.getById(id);
    }

    async function getByEmail(email) {
        return await repository.getByEmail(email);
    }

    async function criarUsuario(dados) {
        const usuario_existe = await repository.getByEmail(dados.usu_email)
        if (usuario_existe.rowCount != 0) {
            throw new AppError(RESPONSE.USUARIO_JA_CADASTRADO);
        }

        const SECRET = process.env.SECRET;
        const hash = await bcrypt.hash(dados.usu_password + SECRET, 10)
        dados.usu_password = hash;

        const usuario = await repository.criarUsuario(dados);
        return assinarToken(usuario);
    }

    function assinarToken(payload) {
        delete payload.usu_password;
        const token = jwt.sign(payload, configJwt.secret, configJwt.options)
        return { ...payload, jwt: token };
    }

    return { listar, getById, criarUsuario, getByEmail }
}

export default criarServiceUsuario;