import database from '../../../config/database.js';

export class PostgresSagaRepository {
  constructor(db = database) {
    this.db = db;
  }

  async salvar(saga) {
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO orquestrador.sagas (sag_id, sag_tipo, sag_status, sag_payload, sag_resultado)
         VALUES ($1, $2, $3, $4, $5)`,
        [saga.id, saga.tipo, saga.status, JSON.stringify(saga.payload), saga.resultado ? JSON.stringify(saga.resultado) : null]
      );

      for (const passo of saga.passos) {
        await client.query(
          `INSERT INTO orquestrador.saga_passos (sag_id, pas_nome, pas_status, pas_detalhe)
           VALUES ($1, $2, $3, $4)`,
          [saga.id, passo.nome, passo.status, passo.detalhe ? JSON.stringify(passo.detalhe) : null]
        );
      }

      await client.query('COMMIT');
    } catch (erro) {
      await client.query('ROLLBACK');
      throw erro;
    } finally {
      client.release();
    }

    return saga;
  }

  async buscarPorId(sagaId) {
    const sagaResult = await this.db.query('SELECT * FROM orquestrador.sagas WHERE sag_id = $1', [sagaId]);
    const sagaRow = sagaResult.rows[0];
    if (!sagaRow) return null;

    const passosResult = await this.db.query(
      'SELECT * FROM orquestrador.saga_passos WHERE sag_id = $1 ORDER BY pas_id ASC',
      [sagaId]
    );

    return { ...sagaRow, passos: passosResult.rows };
  }
}

export default PostgresSagaRepository;
