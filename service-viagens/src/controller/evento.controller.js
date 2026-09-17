// controller/evento.controller.js
import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/evento.dto.js';

function criarControllerEvento(service) {
    async function listar(_req, res) {
        const data = await service.listar();
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function getById(req, res) {
        const data = await service.getById(req.params.id);
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function criarEvento(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarEvento(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function editarEvento(req, res) {
        const body = dto.editarDto(req.body);
        const data = await service.editarEvento(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function deletarEvento(req, res) {
        const body = dto.deletarDto(req.body);
        const data = await service.deletarEvento(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    return { listar, getById, criarEvento, editarEvento, deletarEvento }
}

export default criarControllerEvento;