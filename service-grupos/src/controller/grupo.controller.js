import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/grupo.dto.js';

function criarControllerGrupo(service) {
    async function listarMeusGrupos(req, res) {
        const data = (await service.listarPorUsuario(req.usuario.usu_id)).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function getById(req, res) {
        const data = await service.getById(req.params.id);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function criarGrupo(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarGrupo(body, req.usuario);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function editarGrupo(req, res) {
        const body = dto.editarDto({ ...req.body, gru_id: Number(req.params.id) });
        const data = await service.editarGrupo(body, req.usuario);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function deletarGrupo(req, res) {
        const data = await service.deletarGrupo(Number(req.params.id), req.usuario);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    return { listarMeusGrupos, getById, criarGrupo, editarGrupo, deletarGrupo };
}

export default criarControllerGrupo;
