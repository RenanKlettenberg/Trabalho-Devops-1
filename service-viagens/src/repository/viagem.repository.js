function criarRepositoryViagem(database) {
    async function listar(req, res) {
        const sql = "SELECT * FROM viagem.viagens";
        return await database.execute(sql);
    }

    async function getById(id) {
        const sql = "SELECT * FROM viagem.viagens WHERE via_id = $1";
        return await database.execute(sql, [id]);
    }

    async function criarViagem(params) {
        const sql = "INSERT INTO viagem.viagens (via_nome, via_data_ini, via_data_fim, gru_id) VALUES($1,$2,$3,$4) RETURNING *";
        return (await database.execute(sql, [params.via_nome, params.via_data_ini, params.via_data_fim, params.gru_id])).rows[0];
    }

    async function editarViagem(params) {
        const sql = "UPDATE viagem.viagens SET via_nome = $1, via_data_ini = $2, via_data_fim = $3) WHERE via_id = $4";
        return (await database.execute(sql, [params.via_nome, params.via_data_ini, params.via_data_fim, params.via_id]));
    }

    async function deleteViagem(params) {
        const sql = "DELETE FROM viagem.viagens WHERE via_id = $1";
        return (await database.execute(sql, [params.via_id]));
    }

    return { listar, getById, criarViagem, editarViagem, deleteViagem };
}

export default criarRepositoryViagem;