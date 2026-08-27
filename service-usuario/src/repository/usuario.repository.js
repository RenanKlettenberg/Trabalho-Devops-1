function criarRepositoryUsuario(database) {
    async function listar(req, res) {
        const sql = "SELECT * FROM usuario.usuarios";
        return await database.execute(sql);
    }

    async function getById(id) {
        const sql = "SELECT * FROM usuario.usuarios WHERE usu_id = $1";
        return await database.execute(sql, [id]);
    }

    async function getByEmail(email) {
        const sql = "SELECT * FROM usuario.usuarios WHERE usu_email = $1";
        return await database.execute(sql, [email]);
    }

    async function criarUsuario(params) {
        const sql = "INSERT INTO usuario.usuarios (usu_nome,usu_email,usu_password) VALUES ($1,$2,$3) RETURNING *";
        return (await database.execute(sql, [params.usu_nome, params.usu_email, params.usu_password])).rows[0];
    }

    return { listar, getById, getByEmail, criarUsuario }
}

export default criarRepositoryUsuario;