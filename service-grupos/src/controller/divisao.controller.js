import RESPONSE from '../shared/constants/response.js';
import { calcularDivisaoDto } from '../dto/despesaParticipante.dto.js';

function criarControllerDivisao(service) {
    async function calcularDivisaoDespesa(req, res) {
        const body = calcularDivisaoDto(req.body);
        const data = await service.calcularDivisaoDespesa({
            gru_id: Number(req.params.gruId),
            des_id: Number(req.params.desId),
            valor: body.valor,
        });
        res.json({ ...RESPONSE.SUCESSO, payload: data });
    }

    return { calcularDivisaoDespesa };
}

export default criarControllerDivisao;
