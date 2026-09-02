import { PostgresDespesaRepository } from '../../../src/infrastructure/adapters/out/database/postgres/PostgresDespesaRepository.js';
import { Despesa } from '../../../src/domain/entities/Despesa.js';

describe('Integração: PostgresDespesaRepository', () => {
  let repository;

  beforeAll(async () => {
    // Aqui iria a lógica de conexão com o banco de testes
    repository = new PostgresDespesaRepository();
  });

  afterEach(async () => {
    // Limpar as tabelas após cada teste para garantir isolamento
    // await db.query('TRUNCATE despesas;');
  });

  it('deve salvar uma despesa no banco de dados e conseguir buscá-la', async () => {
    const novaDespesa = new Despesa({
      descricao: 'Jantar de Negócios',
      valor: 250,
      moeda: 'BRL',
      categoria: 'ALIMENTACAO',
      viagemId: 'v-123'
    });

    // Ação: Salvar
    await repository.salvar(novaDespesa);

    // Ação: Buscar para validar
    const despesasDaViagem = await repository.buscarPorViagem('v-123');

    expect(despesasDaViagem).toHaveLength(1);
    expect(despesasDaViagem[0].descricao).toBe('Jantar de Negócios');
    expect(despesasDaViagem[0].id).toBe(novaDespesa.id);
  });

  it('deve atualizar o status de múltiplas despesas em lote', async () => {
    const despesa1 = new Despesa({ descricao: 'A', valor: 10, moeda: 'USD', categoria: 'OUTROS', viagemId: 'v-999' });
    const despesa2 = new Despesa({ descricao: 'B', valor: 20, moeda: 'USD', categoria: 'OUTROS', viagemId: 'v-999' });
    
    await repository.salvar(despesa1);
    await repository.salvar(despesa2);

    despesa1.cancelar();
    despesa2.cancelar();

    // Ação: Atualizar em lote
    await repository.atualizarEmLote([despesa1, despesa2]);

    const despesas = await repository.buscarPorEventoId('v-999');
    expect(despesas[0].status).toBe('ESTORNADA');
    expect(despesas[1].status).toBe('ESTORNADA');
  });
});