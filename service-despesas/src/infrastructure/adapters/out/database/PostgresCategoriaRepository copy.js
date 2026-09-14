class PostgresCategoriaRepository {
  constructor(db) {
    this.db = db;
  }

  async listarTodas() {
    const query = 'SELECT * FROM categorias ORDER BY nome ASC';
    const result = await this.db.query(query);
    return result.rows;
  }

  async buscarPorId(id) {
    const query = 'SELECT * FROM categorias WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }
}

export { PostgresCategoriaRepository };
export default PostgresCategoriaRepository;