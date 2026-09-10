const DespesaRepository = require('../../../../domain/repositories/DespesaRepository');
const Despesa = require('../../../../domain/entities/Despesa');
const NotFoundException = require('../../../exceptions/NotFoundException');

class PostgresDespesaRepository extends DespesaRepository {
  // A conexão do banco (ex: pool do `pg`) é injetada via construtor
  constructor(dbConnection) {
    super();
    this.db = dbConnection;
  }

  async salvar(despesa) {
    const query = `
      INSERT INTO despesas 
      (id, titulo, valor, data, categoria_id, participante_id, grupo_id, moeda, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;
    
    const values = [
      despesa.id, 
      despesa.titulo, 
      despesa.valor, 
      despesa.data, 
      despesa.categoriaId, 
      despesa.participanteId, 
      despesa.grupoId, 
      despesa.moeda, 
      despesa.status
    ];

    await this.db.query(query, values);
  }

  async buscarPorId(id) {
    const query = `SELECT * FROM despesas WHERE id = $1;`;
    const { rows } = await this.db.query(query, [id]);

    const despesaRow = rows[0];

    // Aqui utilizamos a exceção padronizada de recurso não encontrado
    if (!despesaRow) {
      throw new NotFoundException(`Despesa com ID ${id} não encontrada no banco de dados.`);
    }

    // Hidrata e retorna a entidade de domínio
    return new Despesa({
      id: despesaRow.id,
      titulo: despesaRow.titulo,
      valor: parseFloat(despesaRow.valor),
      data: despesaRow.data,
      categoriaId: despesaRow.categoria_id,
      participanteId: despesaRow.participante_id,
      grupoId: despesaRow.grupo_id,
      moeda: despesaRow.moeda,
      status: despesaRow.status
    });
  }

  async atualizar(despesa) {
    const query = `
      UPDATE despesas 
      SET titulo = $1, valor = $2, data = $3, status = $4
      WHERE id = $5;
    `;
    
    const values = [
      despesa.titulo, 
      despesa.valor, 
      despesa.data, 
      despesa.status, 
      despesa.id
    ];

    const result = await this.db.query(query, values);

    if (result.rowCount === 0) {
      throw new NotFoundException(`Despesa com ID ${despesa.id} não encontrada para atualização.`);
    }
  }

  async obterResumoDashboard({ participanteId, dataInicio, dataFim }) {
    // Exemplo de uma query analítica otimizada (Query Model)
    const query = `
      SELECT 
        SUM(valor) as "totalGasto",
        SUM(CASE WHEN status = 'PENDENTE' THEN valor ELSE 0 END) as "totalPendente",
        SUM(CASE WHEN status = 'PAGA' THEN valor ELSE 0 END) as "totalPago"
      FROM despesas
      WHERE participante_id = $1 
        AND data >= $2 
        AND data <= $3
        AND status != 'CANCELADA';
    `;

    const { rows } = await this.db.query(query, [participanteId, dataInicio, dataFim]);
    
    return {
      totalGasto: parseFloat(rows[0].totalGasto || 0),
      totalPendente: parseFloat(rows[0].totalPendente || 0),
      totalPago: parseFloat(rows[0].totalPago || 0)
    };
  }
}

module.exports = PostgresDespesaRepository;