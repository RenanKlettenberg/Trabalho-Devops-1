import DespesaRepository from '../../../../domain/repositories/DespesaRepository.js';
import Despesa from '../../../../domain/entities/Despesa.js';

function linhaParaDespesa(linha) {
  if (!linha) return null;

  return new Despesa({
    id: linha.des_id,
    descricao: linha.des_descricao,
    valor: Number(linha.des_valor),
    moeda: linha.des_moeda_original,
    categoria: linha.des_categoria,
    viagemId: linha.des_viagem_id,
    eventoId: linha.des_evento_id,
    status: linha.des_status,
    createdAt: linha.des_created_at,
    updatedAt: linha.des_updated_at,
  });
}

class PostgresDespesaRepository extends DespesaRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  async salvar(despesa) {
    const sql = `
      INSERT INTO despesas.despesas (
        des_id, des_descricao, des_valor, des_moeda_original,
        des_categoria, des_viagem_id, des_evento_id, des_status, des_updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (des_id) DO UPDATE SET
        des_descricao = EXCLUDED.des_descricao,
        des_valor = EXCLUDED.des_valor,
        des_moeda_original = EXCLUDED.des_moeda_original,
        des_categoria = EXCLUDED.des_categoria,
        des_viagem_id = EXCLUDED.des_viagem_id,
        des_evento_id = EXCLUDED.des_evento_id,
        des_status = EXCLUDED.des_status,
        des_updated_at = NOW()
      RETURNING *;
    `;

    const parametros = [
      despesa.id,
      despesa.descricao,
      despesa.valor,
      despesa.moeda.codigo,
      despesa.categoria.valor,
      despesa.viagemId,
      despesa.eventoId,
      despesa.status,
    ];

    const { rows } = await this.database.query(sql, parametros);
    return linhaParaDespesa(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.database.query(
      'SELECT * FROM despesas.despesas WHERE des_id = $1',
      [id]
    );
    return linhaParaDespesa(rows[0]);
  }

  async buscarPorViagemId(viagemId) {
    const { rows } = await this.database.query(
      'SELECT * FROM despesas.despesas WHERE des_viagem_id = $1 ORDER BY des_created_at ASC',
      [viagemId]
    );
    return rows.map(linhaParaDespesa);
  }

  async buscarPorEventoId(eventoId) {
    const { rows } = await this.database.query(
      'SELECT * FROM despesas.despesas WHERE des_evento_id = $1 ORDER BY des_created_at ASC',
      [eventoId]
    );
    return rows.map(linhaParaDespesa);
  }
}

export { PostgresDespesaRepository };
export default PostgresDespesaRepository;
