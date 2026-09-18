// repository/evento.repository.js
function criarRepositoryEvento(database) {
    async function listar(filtros = {}) {
        if (filtros.via_id) {
            const sql = "SELECT * FROM viagem.eventos WHERE via_id = $1 ORDER BY eve_ordem";
            return (await database.execute(sql, [filtros.via_id])).rows;
        }

        const sql = "SELECT * FROM viagem.eventos ORDER BY eve_ordem";
        return (await database.execute(sql)).rows;
    }

    async function getById(id, usu_id) {
        const sql = "SELECT * FROM viagem.eventos WHERE eve_id = $1 AND usu_id = $2";
        return (await database.execute(sql, [id, usu_id])).rows[0] ?? null;
    }

    async function getViagemById(via_id) {
        const sql = "SELECT * FROM viagem.viagens WHERE via_id = $1";
        return (await database.execute(sql, [via_id])).rows[0] ?? null;
    }

    async function getUltimaOrdemByViagem(via_id) {
        const sql = "SELECT COALESCE(MAX(eve_ordem), 0) AS ultima FROM viagem.eventos WHERE via_id = $1";
        const result = await database.execute(sql, [via_id]);
        return Number(result.rows[0].ultima);
    }

    async function criarEvento(params) {
        const sql = `
            INSERT INTO viagem.eventos (
                eve_nome, eve_descricao, eve_status, eve_categoria,
                eve_data_ini, eve_data_fim, eve_data_estimatida,
                eve_orcamento, eve_ordem, via_id, usu_id
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *
        `;
        const result = await database.execute(sql, [
            params.eve_nome,
            params.eve_descricao ?? null,
            params.eve_status,
            params.eve_categoria,
            params.eve_data_ini ?? null,
            params.eve_data_fim ?? null,
            params.eve_data_estimatida,
            params.eve_orcamento,
            params.eve_ordem,
            params.via_id,
            params.usu_id,
        ]);
        return result.rows[0];
    }

    async function editarEvento(params) {
        const sql = `
            UPDATE viagem.eventos
            SET eve_nome = COALESCE($1, eve_nome),
                eve_descricao = COALESCE($2, eve_descricao),
                eve_status = COALESCE($3, eve_status),
                eve_categoria = COALESCE($4, eve_categoria),
                eve_data_ini = COALESCE($5, eve_data_ini),
                eve_data_fim = COALESCE($6, eve_data_fim),
                eve_data_estimatida = COALESCE($7, eve_data_estimatida),
                eve_orcamento = COALESCE($8, eve_orcamento),
                eve_ordem = COALESCE($9, eve_ordem)
            WHERE eve_id = $10
            RETURNING *
        `;
        const result = await database.execute(sql, [
            params.eve_nome ?? null,
            params.eve_descricao ?? null,
            params.eve_status ?? null,
            params.eve_categoria ?? null,
            params.eve_data_ini ?? null,
            params.eve_data_fim ?? null,
            params.eve_data_estimatida ?? null,
            params.eve_orcamento ?? null,
            params.eve_ordem ?? null,
            params.eve_id,
        ]);
        return result.rows[0];
    }

    async function deletarEvento(params) {
        const sql = "DELETE FROM viagem.eventos WHERE eve_id = $1 RETURNING *";
        const result = await database.execute(sql, [params.eve_id]);
        return result.rows[0];
    }

    async function marcarFalhaSincronizacaoDespesa(eve_id) {
        const sql = "UPDATE viagem.eventos SET eve_sync_despesa_status = 2 WHERE eve_id = $1"; // 2 = falha
        return await database.execute(sql, [eve_id]);
    }

    return {
        listar, getById, getViagemById, getUltimaOrdemByViagem,
        criarEvento, editarEvento, deletarEvento, marcarFalhaSincronizacaoDespesa,
    };
}

export default criarRepositoryEvento;