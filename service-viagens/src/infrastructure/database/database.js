import pool from './connection.js';

async function execute(sql, params = false) {
    let resultado;
    if (params) {
        resultado = await pool.query(sql, params);
    } else {
        resultado = await pool.query(sql);
    }
    return {rows: resultado.rows, rowCount: resultado.rowCount};
}

async function transaction(callback) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const resultado = await callback(client);
        await client.query("COMMIT");
        return {rows: resultado.rows, rowCount: resultado.rowCount};
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export default { execute, transaction };