function criarRepositoryParticipante(database) {
    async function listarPorGrupo(gru_id) {
        const sql = "SELECT * FROM grupos.participantes WHERE gru_id = $1";
        return await database.execute(sql, [gru_id]);
    }

    async function getById(par_id) {
        const sql = "SELECT * FROM grupos.participantes WHERE par_id = $1";
        return await database.execute(sql, [par_id]);
    }

    // Usado pelo service pra checar o limite do plano antes de inserir
    async function contarPorGrupo(gru_id) {
        const sql = "SELECT COUNT(*)::int AS total FROM grupos.participantes WHERE gru_id = $1";
        const resultado = await database.execute(sql, [gru_id]);
        return resultado.rows[0].total;
    }

    async function criarParticipante(params) {
        const sql = `INSERT INTO grupos.participantes (gru_id, usu_id, par_nome, par_isento)
                     VALUES ($1, $2, $3, $4) RETURNING *`;
        const resultado = await database.execute(sql, [
            params.gru_id,
            params.usu_id ?? null,
            params.par_nome,
            params.par_isento,
        ]);
        return resultado.rows[0];
    }

    async function editarParticipante(params) {
        const sql = `UPDATE grupos.participantes
                     SET par_nome = COALESCE($1, par_nome),
                         par_isento = COALESCE($2, par_isento)
                     WHERE par_id = $3 RETURNING *`;
        const resultado = await database.execute(sql, [
            params.par_nome ?? null,
            params.par_isento ?? null,
            params.par_id,
        ]);
        return resultado.rows[0];
    }

    async function deletarParticipante(par_id) {
        const sql = "DELETE FROM grupos.participantes WHERE par_id = $1";
        return await database.execute(sql, [par_id]);
    }

    return {
        listarPorGrupo,
        getById,
        contarPorGrupo,
        criarParticipante,
        editarParticipante,
        deletarParticipante,
    };
}

export default criarRepositoryParticipante;
