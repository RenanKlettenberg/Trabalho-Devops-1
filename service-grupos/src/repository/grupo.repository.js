function criarRepositoryGrupo(database) {
    async function listarPorUsuario(usu_id_dono) {
        const sql = "SELECT * FROM grupos.grupos WHERE usu_id_dono = $1";
        return await database.execute(sql, [usu_id_dono]);
    }

    async function getById(gru_id) {
        const sql = "SELECT * FROM grupos.grupos WHERE gru_id = $1";
        return await database.execute(sql, [gru_id]);
    }

    async function criarGrupo(params) {
        const sql = "INSERT INTO grupos.grupos (gru_nome, usu_id_dono) VALUES ($1, $2) RETURNING *";
        const resultado = await database.execute(sql, [params.gru_nome, params.usu_id_dono]);
        return resultado.rows[0];
    }

    async function editarGrupo(params) {
        const sql = "UPDATE grupos.grupos SET gru_nome = $1 WHERE gru_id = $2 RETURNING *";
        const resultado = await database.execute(sql, [params.gru_nome, params.gru_id]);
        return resultado.rows[0];
    }

    async function deletarGrupo(gru_id) {
        const sql = "DELETE FROM grupos.grupos WHERE gru_id = $1";
        return await database.execute(sql, [gru_id]);
    }

    return { listarPorUsuario, getById, criarGrupo, editarGrupo, deletarGrupo };
}

export default criarRepositoryGrupo;
