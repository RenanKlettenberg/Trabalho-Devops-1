import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/viagem.dto.js';

function criarControllerViagem(service) {
    async function listar(_req, res) {
        const data = await service.listar();
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function getById(req, res) {
        const data = await service.getById(req.params.id);
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    async function criarViagem(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarViagem(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }
    
    async function editarViagem(req, res) {
        const body = dto.editarDto({ ...req.body, via_id: Number(req.params.id) });
        const data = await service.editarViagem(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }
    
    async function deletarViagem(req, res) {
        const body = dto.deletarDto({ ...req.body, via_id: Number(req.params.id) });
        const data = await service.deletarViagem(body);

        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    return { listar, getById, criarViagem, editarViagem, deletarViagem }
}

export default criarControllerViagem;