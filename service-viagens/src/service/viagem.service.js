import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from "../infrastructure/errors/app.error.js";
import RESPONSE from "../shared/constants/response.js";
import configJwt from '../infrastructure/config/jwt.js';
import pepperConfig from '../infrastructure/config/pepper.js';

function criarServiceViagem(repository) {
    async function listar(req, res) {
        return await repository.listar();
    }

    async function getById(id) {
        return await repository.getById(id);
    }

    async function criarViagem(dados) {

    }

    async function editarViagem(dados) {

    }

    async function deletarViagem(dados) {

    }

    return { listar, getById, criarViagem, editarViagem, deletarViagem }
}

export default criarServiceViagem;