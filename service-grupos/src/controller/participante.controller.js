import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/participante.dto.js';

function criarControllerParticipante(service) {
    async function listarPorGrupo(req, res) {
        const data = (await service.listarPorGrupo(req.params.gruId)).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function getById(req, res) {
        const data = (await service.getById(req.params.id)).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function criarParticipante(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarParticipante(body, req.usuario);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function editarParticipante(req, res) {
        // req.params vem sempre como string - convertemos antes de validar com o dto (que espera number)
        const body = dto.editarDto({ ...req.body, par_id: Number(req.params.id) });
        const data = await service.editarParticipante(body);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function deletarParticipante(req, res) {
        const body = dto.deletarDto({ par_id: Number(req.params.id) });
        const data = await service.deletarParticipante(body.par_id);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    return { listarPorGrupo, getById, criarParticipante, editarParticipante, deletarParticipante };
}

export default criarControllerParticipante;
