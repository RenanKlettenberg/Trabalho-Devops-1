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

    /*
        Usado pela saga. O RabbitMQ pode entregar a mesma mensagem duas vezes,
        então o ON CONFLICT faz a operação ser idempotente: reprocessar o mesmo
        comando reescreve os vínculos com os mesmos valores, em vez de estourar
        a constraint uq_despesa_participante.
    */
    async function criarVinculosEmLote(des_id, itens) {
        const parametros = [des_id];

        const valores = itens.map((item) => {
            const base = parametros.length;
            parametros.push(item.par_id, item.dp_exclusiva ?? false, item.dp_peso ?? null);
            return `($1, $${base + 1}, $${base + 2}, $${base + 3})`;
        });

        const sql = `INSERT INTO grupos.despesa_participante (des_id, par_id, dp_exclusiva, dp_peso)
                     VALUES ${valores.join(', ')}
                     ON CONFLICT (des_id, par_id) DO UPDATE
                         SET dp_exclusiva = EXCLUDED.dp_exclusiva,
                             dp_peso = EXCLUDED.dp_peso
                     RETURNING *`;

        return await database.execute(sql, parametros);
    }

    // Ação de compensação da saga: desfaz tudo que foi vinculado a uma despesa.
    async function deletarPorDespesa(des_id) {
        const sql = "DELETE FROM grupos.despesa_participante WHERE des_id = $1";
        return await database.execute(sql, [des_id]);
    }

    return {
        listarPorDespesa,
        getById,
        criarVinculo,
        deletarVinculo,
        criarVinculosEmLote,
        deletarPorDespesa,
    };
}

export default criarRepositoryDespesaParticipante;
