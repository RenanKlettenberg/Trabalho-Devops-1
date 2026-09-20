import database from '../../../config/database.js';
import Despesa from '../../../../domain/entities/Despesa.js';

const TABELA = 'despesas.despesas';
const COLUNAS_ALIASADAS = `
  des_id AS id,
  des_descricao AS descricao,
  des_valor AS valor,
  des_moeda_original AS "moedaOriginal",
  des_categoria AS categoria,
  des_viagem_id AS "viagemId",
  des_evento_id AS "eventoId",
  des_status AS status
`;

// O driver 'pg' devolve NUMERIC como string e as linhas são objetos simples;
// reidrata para instâncias de Despesa para que métodos de domínio (ex: cancelar()) funcionem.
function mapRowToDespesa(row) {
  if (!row) return null;
  return new Despesa({ ...row, valor: Number(row.valor) });
}

class PostgresDespesaRepository {
  /**
   * @param {Object} db - Pool de conexão do banco de dados (ex: pg, knex)
   */
  constructor(db = database) {
    this.db = db;
  }

  async salvar(despesa) {
    const query = `
      INSERT INTO ${TABELA} (des_id, des_descricao, des_valor, des_moeda_original, des_categoria, des_viagem_id, des_evento_id, des_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${COLUNAS_ALIASADAS};
    `;
    const values = [
      despesa.id, despesa.descricao, despesa.valor, despesa.moedaOriginal,
      despesa.categoria, despesa.viagemId, despesa.eventoId, despesa.status
    ];

    const result = await this.db.query(query, values);
    return mapRowToDespesa(result.rows[0]);
  }

  async buscarPorId(id) {
    const query = `SELECT ${COLUNAS_ALIASADAS} FROM ${TABELA} WHERE des_id = $1`;
    const result = await this.db.query(query, [id]);
    return mapRowToDespesa(result.rows[0]);
  }

  async buscarPorViagem(viagemId) {
    const result = await this.db.query(
      `SELECT ${COLUNAS_ALIASADAS} FROM ${TABELA} WHERE des_viagem_id = $1`,
      [viagemId]
    );
    return result.rows.map(mapRowToDespesa);
  }

  async buscarPorEventoId(eventoId) {
    const result = await this.db.query(
      `SELECT ${COLUNAS_ALIASADAS} FROM ${TABELA} WHERE des_evento_id = $1`,
      [eventoId]
    );
    return result.rows.map(mapRowToDespesa);
  }

  async atualizarEmLote(despesas) {
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');
      for (const despesa of despesas) {
        await client.query(
          `UPDATE ${TABELA} SET des_status = $1, des_updated_at = NOW() WHERE des_id = $2`,
          [despesa.status, despesa.id]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export { PostgresDespesaRepository };
export default PostgresDespesaRepository;
