// repository/usuario.repository.js
function criarRepositoryUsuario(database) {
    async function listar() {
        const sql = "SELECT * FROM usuario.usuarios";
        return await database.execute(sql);
    }

    async function getById(id) {
        const sql = "SELECT * FROM usuario.usuarios WHERE usu_id = $1";
        return (await database.execute(sql, [id])).rows[0] ?? null;
    }

    async function getByEmail(email) {
        const sql = "SELECT * FROM usuario.usuarios WHERE usu_email = $1";
        return await database.execute(sql, [email]);
    }

    async function criarUsuario(params) {
        const sql = "INSERT INTO usuario.usuarios (usu_nome, usu_email, usu_password, usu_plano) VALUES ($1,$2,$3,$4) RETURNING *";
        return (await database.execute(sql, [params.usu_nome, params.usu_email, params.usu_password, params.usu_plano])).rows[0];
    }

    async function editarUsuario(params) {
        const sql = `
            UPDATE usuario.usuarios
            SET usu_nome = COALESCE($1, usu_nome),
                usu_email = COALESCE($2, usu_email),
                usu_plano = COALESCE($3, usu_plano)
            WHERE usu_id = $4
            RETURNING *
        `;
        const result = await database.execute(sql, [
            params.usu_nome ?? null,
            params.usu_email ?? null,
            params.usu_plano ?? null,
            params.usu_id,
        ]);
        return result.rows[0];
    }

    async function deletarUsuario(params) {
        const sql = "DELETE FROM usuario.usuarios WHERE usu_id = $1 RETURNING *";
        const result = await database.execute(sql, [params.usu_id]);
        return result.rows[0];
    }

    return { listar, getById, getByEmail, criarUsuario, editarUsuario, deletarUsuario }
}

export default criarRepositoryUsuario;