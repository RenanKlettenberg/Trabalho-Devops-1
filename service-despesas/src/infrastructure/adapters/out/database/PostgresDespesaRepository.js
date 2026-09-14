import database from '../../../config/database.js';

class PostgresDespesaRepository {
  /**
   * @param {Object} db - Pool de conexão do banco de dados (ex: pg, knex)
   */
  constructor(db = database) {
    this.db = db;
  }

  async salvar(despesa) {
    const query = `
      INSERT INTO despesas (id, valor, descricao, data, categoria_id, moeda_id, usuario_id, grupo_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      despesa.id, despesa.valor, despesa.descricao, despesa.data, 
      despesa.categoriaId, despesa.moedaId, despesa.usuarioId, despesa.grupoId, despesa.status
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async buscarPorId(id) {
    const query = 'SELECT * FROM despesas WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async atualizarStatus(id, novoStatus) {
    const query = 'UPDATE despesas SET status = $1 WHERE id = $2 RETURNING *;';
    const result = await this.db.query(query, [novoStatus, id]);
    return result.rows[0];
  }

  async buscarPorViagem(viagemId) {
    const result = await this.db.query(
      'SELECT * FROM despesas WHERE viagem_id = $1',
      [viagemId]
    );
    return result.rows;
  }

  async buscarPorEventoId(eventoId) {
    const result = await this.db.query(
      'SELECT * FROM despesas WHERE evento_id = $1 OR viagem_id = $1',
      [eventoId]
    );
    return result.rows;
  }

  async atualizarEmLote(despesas) {
    for (const despesa of despesas) {
      await this.atualizarStatus(despesa.id, despesa.status);
    }
  }
}

export { PostgresDespesaRepository };
export default PostgresDespesaRepository;