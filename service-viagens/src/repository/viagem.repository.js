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
        const sql = "INSERT INTO viagem.viagens (usu_nome,usu_email,usu_password) VALUES ($1,$2,$3) RETURNING *";
        return (await database.execute(sql, [params.usu_nome, params.usu_email, params.usu_password])).rows[0];
    }

    async function editarViagem(params) {
        const sql = "INSERT INTO viagem.viagens (usu_nome,usu_email,usu_password) VALUES ($1,$2,$3) RETURNING *";
        return (await database.execute(sql, [params.usu_nome, params.usu_email, params.usu_password])).rows[0];
    }

    async function deleteViagem(params) {
        const sql = "INSERT INTO viagem.viagens (usu_nome,usu_email,usu_password) VALUES ($1,$2,$3) RETURNING *";
        return (await database.execute(sql, [params.usu_nome, params.usu_email, params.usu_password])).rows[0];
    }

    return { listar, getById, criarViagem, editarViagem, deleteViagem };
}

export default criarRepositoryViagem;