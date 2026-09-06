import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';
import { LIMITE_PARTICIPANTES_POR_PLANO, PLANO_PADRAO } from '../shared/constants/planos.js';

function criarServiceParticipante(repository, grupoService) {
    async function listarPorGrupo(gru_id) {
        return await repository.listarPorGrupo(gru_id);
    }

    async function getById(par_id) {
        const resultado = await repository.getById(par_id);
        if (resultado.rowCount === 0) {
            throw new AppError(RESPONSE.PARTICIPANTE_NAO_ENCONTRADO);
        }
        return resultado;
    }

    async function criarParticipante(params, usuario) {

        await grupoService.verificarDono(params.gru_id, usuario.usu_id);

        const plano = usuario?.usu_plano ?? PLANO_PADRAO; // renan add coluna
        const limite = LIMITE_PARTICIPANTES_POR_PLANO[plano] ?? LIMITE_PARTICIPANTES_POR_PLANO[PLANO_PADRAO];

        const totalAtual = await repository.contarPorGrupo(params.gru_id);

        if (totalAtual >= limite) {
            throw new AppError({
                ...RESPONSE.LIMITE_PARTICIPANTES_EXCEDIDO,
                payload: { plano, limite, totalAtual },
            });
        }

        return await repository.criarParticipante(params);
    }

    async function editarParticipante(params) {
        await getById(params.par_id); // valida que existe, ou lança PARTICIPANTE_NAO_ENCONTRADO
        return await repository.editarParticipante(params);
    }

    async function deletarParticipante(par_id) {
        await getById(par_id);
        return await repository.deletarParticipante(par_id);
    }

    return { listarPorGrupo, getById, criarParticipante, editarParticipante, deletarParticipante };
}

export default criarServiceParticipante;
