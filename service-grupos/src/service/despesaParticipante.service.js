import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';

function criarServiceDespesaParticipante(repository, participanteService, grupoService) {
    async function listarPorDespesa(des_id) {
        return await repository.listarPorDespesa(des_id);
    }

    async function criarVinculo(params, usuario) {

        const participanteResult = await participanteService.getById(params.par_id);
        const participante = participanteResult.rows[0];

        await grupoService.verificarDono(participante.gru_id, usuario.usu_id);

        return await repository.criarVinculo(params);
    }

    async function deletarVinculo(dp_id) {
        const resultado = await repository.getById(dp_id);
        if (resultado.rowCount === 0) {
            throw new AppError(RESPONSE.PARTICIPANTE_NAO_ENCONTRADO);
        }
        return await repository.deletarVinculo(dp_id);
    }

    return { listarPorDespesa, criarVinculo, deletarVinculo };
}

export default criarServiceDespesaParticipante;
