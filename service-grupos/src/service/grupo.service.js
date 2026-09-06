import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';

function criarServiceGrupo(repository) {
    async function listarPorUsuario(usu_id) {
        return await repository.listarPorUsuario(usu_id);
    }

    async function getById(gru_id) {
        const resultado = await repository.getById(gru_id);
        if (resultado.rowCount === 0) {
            throw new AppError(RESPONSE.GRUPO_NAO_ENCONTRADO);
        }
        return resultado.rows[0];
    }

    async function criarGrupo(params, usuario) {
        return await repository.criarGrupo({ ...params, usu_id_dono: usuario.usu_id });
    }

    async function editarGrupo(params, usuario) {
        await verificarDono(params.gru_id, usuario.usu_id);
        return await repository.editarGrupo(params);
    }

    async function deletarGrupo(gru_id, usuario) {
        await verificarDono(gru_id, usuario.usu_id);
        return await repository.deletarGrupo(gru_id);
    }

    // só o dono do grupo pode gerenciá-lo
    async function verificarDono(gru_id, usu_id) {
        const grupo = await getById(gru_id);
        if (grupo.usu_id_dono !== usu_id) {
            throw new AppError(RESPONSE.SEM_PERMISSAO);
        }
        return grupo;
    }

    return { listarPorUsuario, getById, criarGrupo, editarGrupo, deletarGrupo, verificarDono };
}

export default criarServiceGrupo;
