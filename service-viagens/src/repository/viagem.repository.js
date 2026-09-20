// repository/viagem.repository.js
function criarRepositoryViagem(database) {
    async function listar(filtros = {}) {
        if (filtros.usu_id) {
            const sql = "SELECT * FROM viagem.viagens WHERE usu_id = $1";
            return (await database.execute(sql, [filtros.usu_id])).rows;
        }

        const sql = "SELECT * FROM viagem.viagens";
        return (await database.execute(sql)).rows;
    }

    async function getById(id, usu_id) {
        const sql = "SELECT * FROM viagem.viagens WHERE via_id = $1 AND usu_id = $2";
        return (await database.execute(sql, [id, usu_id])).rows[0] ?? null;
    }

    async function countViagensAtivasByUsuario(usu_id) {
        const sql = "SELECT COUNT(*) FROM viagem.viagens WHERE usu_id = $1 AND via_status = $2";
        const result = await database.execute(sql, [usu_id, 1]); // 1 = STATUS_VIAGEM.ATIVA
        return Number(result.rows[0].count);
    }

    async function criarViagem(params) {
        const sql = `
            INSERT INTO viagem.viagens (via_nome, via_data_ini, via_data_fim, via_status, gru_id, usu_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await database.execute(sql, [
            params.via_nome,
            params.via_data_ini,
            params.via_data_fim,
            params.via_status,
            params.gru_id,
            params.usu_id,
        ]);
        return result.rows[0];
    }

    async function editarViagem(params) {
        const sql = `
            UPDATE viagem.viagens
            SET via_nome = COALESCE($1, via_nome),
                via_data_ini = COALESCE($2, via_data_ini),
                via_data_fim = COALESCE($3, via_data_fim),
                via_status = COALESCE($4, via_status),
                gru_id = COALESCE($5, gru_id)
            WHERE via_id = $6
            RETURNING *
        `;
        const result = await database.execute(sql, [
            params.via_nome ?? null,
            params.via_data_ini ?? null,
            params.via_data_fim ?? null,
            params.via_status ?? null,
            params.gru_id ?? null,
            params.via_id,
        ]);
        return result.rows[0];
    }

    async function deletarViagem(params) {
        const sql = "DELETE FROM viagem.viagens WHERE via_id = $1 RETURNING *";
        const result = await database.execute(sql, [params.via_id]);
        return result.rows[0];
    }

    return { listar, getById, countViagensAtivasByUsuario, criarViagem, editarViagem, deletarViagem };
}

export default criarRepositoryViagem;