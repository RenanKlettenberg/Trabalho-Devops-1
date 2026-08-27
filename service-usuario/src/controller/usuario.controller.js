import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/usuario.dto.js';

function criarControllerUsuario(service) {
    async function listar(req, res) {
        const data = (await service.listar()).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function getById(req, res) {
        const data = (await service.getById(req.params.id)).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function criarUsuario(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarUsuario(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    return { listar, getById, criarUsuario }
}

export default criarControllerUsuario;