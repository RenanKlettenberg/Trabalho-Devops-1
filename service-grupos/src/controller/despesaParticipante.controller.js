import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/despesaParticipante.dto.js';

function criarControllerDespesaParticipante(service) {
    async function listarPorDespesa(req, res) {
        const data = (await service.listarPorDespesa(req.params.desId)).rows;
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function criarVinculo(req, res) {
        const body = dto.criarDto(req.body);
        const data = await service.criarVinculo(body, req.usuario);
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    async function deletarVinculo(req, res) {
        const data = await service.deletarVinculo(Number(req.params.id));
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    return { listarPorDespesa, criarVinculo, deletarVinculo };
}

export default criarControllerDespesaParticipante;
