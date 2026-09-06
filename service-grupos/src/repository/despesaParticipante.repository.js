function criarRepositoryDespesaParticipante(database) {
    async function listarPorDespesa(des_id) {
        const sql = "SELECT * FROM grupos.despesa_participante WHERE des_id = $1";
        return await database.execute(sql, [des_id]);
    }

    async function getById(dp_id) {
        const sql = "SELECT * FROM grupos.despesa_participante WHERE dp_id = $1";
        return await database.execute(sql, [dp_id]);
    }

    async function criarVinculo(params) {
        const sql = `INSERT INTO grupos.despesa_participante (des_id, par_id, dp_exclusiva, dp_peso)
                     VALUES ($1, $2, $3, $4) RETURNING *`;
        const resultado = await database.execute(sql, [
            params.des_id,
            params.par_id,
            params.dp_exclusiva,
            params.dp_peso ?? null,
        ]);
        return resultado.rows[0];
    }

    async function deletarVinculo(dp_id) {
        const sql = "DELETE FROM grupos.despesa_participante WHERE dp_id = $1";
        return await database.execute(sql, [dp_id]);
    }

    return { listarPorDespesa, getById, criarVinculo, deletarVinculo };
}

export default criarRepositoryDespesaParticipante;
