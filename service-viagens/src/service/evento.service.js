// service/evento.service.js
import AppError from "../infrastructure/errors/app.error.js";
import RESPONSE from "../shared/constants/response.js";

function criarServiceEvento(repository, despesaClient) {
    async function listar(req, res) {
        return await repository.listar();
    }

    async function getById(id) {
        return await repository.getById(id);
    }

    async function criarEvento(dados) {

    }

    async function editarEvento(dados) {

    }

    async function deletarEvento(dados) {

    }

    return { listar, getById, criarEvento, editarEvento, deletarEvento }
}

export default criarServiceEvento;