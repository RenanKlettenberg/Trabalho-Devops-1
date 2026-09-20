import { jest } from '@jest/globals';
import { PostgresDespesaRepository } from '../../../../../../src/infrastructure/adapters/out/database/PostgresDespesaRepository.js';
import { Despesa } from '../../../../../../src/domain/entities/Despesa.js';

function linhaDoBanco(overrides = {}) {
  return {
    id: 'd-1',
    descricao: 'Jantar',
    valor: '250.00', // NUMERIC volta como string no driver 'pg'
    moedaOriginal: 'BRL',
    categoria: 'ALIMENTACAO',
    viagemId: 'v-1',
    eventoId: null,
    status: 'ATIVA',
    ...overrides
  };
}

describe('PostgresDespesaRepository (unitário, banco mockado)', () => {
  it('salvar deve inserir com os valores da despesa e devolver uma instância de Despesa', async () => {
    const mockDb = { query: jest.fn().mockResolvedValue({ rows: [linhaDoBanco()] }) };
    const repository = new PostgresDespesaRepository(mockDb);

    const despesa = new Despesa({ id: 'd-1', descricao: 'Jantar', valor: 250, moeda: 'BRL', categoria: 'ALIMENTACAO', viagemId: 'v-1' });
    const resultado = await repository.salvar(despesa);

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO despesas.despesas'),
      ['d-1', 'Jantar', 250, 'BRL', 'ALIMENTACAO', 'v-1', null, 'ATIVA']
    );
    expect(resultado).toBeInstanceOf(Despesa);
    expect(resultado.valor).toBe(250);
    expect(typeof resultado.cancelar).toBe('function');
  });

  it('buscarPorId deve devolver null quando não encontra nenhuma linha', async () => {
    const mockDb = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    const repository = new PostgresDespesaRepository(mockDb);

    const resultado = await repository.buscarPorId('inexistente');

    expect(resultado).toBeNull();
  });

  it('buscarPorViagem deve mapear todas as linhas para instâncias de Despesa', async () => {
    const mockDb = { query: jest.fn().mockResolvedValue({ rows: [linhaDoBanco({ id: 'd-1' }), linhaDoBanco({ id: 'd-2' })] }) };
    const repository = new PostgresDespesaRepository(mockDb);

    const resultado = await repository.buscarPorViagem('v-1');

    expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('WHERE des_viagem_id = $1'), ['v-1']);
    expect(resultado).toHaveLength(2);
    expect(resultado[0]).toBeInstanceOf(Despesa);
  });

  it('buscarPorEventoId deve filtrar apenas por des_evento_id (não deve casar por viagem)', async () => {
    const mockDb = { query: jest.fn().mockResolvedValue({ rows: [linhaDoBanco({ eventoId: 'evento-505' })] }) };
    const repository = new PostgresDespesaRepository(mockDb);

    await repository.buscarPorEventoId('evento-505');

    const [sql, params] = mockDb.query.mock.calls[0];
    const clausulaWhere = sql.slice(sql.indexOf('WHERE'));
    expect(clausulaWhere.trim()).toBe('WHERE des_evento_id = $1');
    expect(params).toEqual(['evento-505']);
  });

  it('atualizarEmLote deve confirmar a transação quando todas as atualizações funcionam', async () => {
    const client = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    const mockDb = { pool: { connect: jest.fn().mockResolvedValue(client) } };
    const repository = new PostgresDespesaRepository(mockDb);

    const despesas = [
      new Despesa({ id: 'd-1', valor: 10, moeda: 'BRL', categoria: 'X', viagemId: 'v-1', status: 'ESTORNADA' }),
      new Despesa({ id: 'd-2', valor: 20, moeda: 'BRL', categoria: 'X', viagemId: 'v-1', status: 'ESTORNADA' })
    ];

    await repository.atualizarEmLote(despesas);

    const chamadas = client.query.mock.calls.map(([sql]) => sql);
    expect(chamadas[0]).toBe('BEGIN');
    expect(chamadas.at(-1)).toBe('COMMIT');
    expect(chamadas.filter((sql) => sql.includes('UPDATE'))).toHaveLength(2);
    expect(client.release).toHaveBeenCalled();
  });

  it('atualizarEmLote deve reverter a transação (ROLLBACK) se alguma atualização falhar', async () => {
    const erroDeBanco = new Error('conexão perdida');
    const client = {
      query: jest.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(erroDeBanco) // primeiro UPDATE falha
        .mockResolvedValueOnce({}), // ROLLBACK
      release: jest.fn()
    };
    const mockDb = { pool: { connect: jest.fn().mockResolvedValue(client) } };
    const repository = new PostgresDespesaRepository(mockDb);

    const despesas = [new Despesa({ id: 'd-1', valor: 10, moeda: 'BRL', categoria: 'X', viagemId: 'v-1', status: 'ESTORNADA' })];

    await expect(repository.atualizarEmLote(despesas)).rejects.toThrow(erroDeBanco);

    const chamadas = client.query.mock.calls.map(([sql]) => sql);
    expect(chamadas).toContain('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });
});
