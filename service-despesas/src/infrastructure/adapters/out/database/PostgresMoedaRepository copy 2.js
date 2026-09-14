class PostgresMoedaRepository {
  constructor(db) {
    this.db = db;
  }

  async listarTodas() {
    const query = 'SELECT * FROM moedas ORDER BY codigo ASC';
    const result = await this.db.query(query);
    return result.rows;
  }

  async buscarPorCodigo(codigo) {
    const query = 'SELECT * FROM moedas WHERE codigo = $1';
    const result = await this.db.query(query, [codigo]);
    return result.rows[0] || null;
  }
}

export { PostgresMoedaRepository };
export default PostgresMoedaRepository;