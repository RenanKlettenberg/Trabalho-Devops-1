import { PostgresSagaRepository } from '../../../src/infrastructure/adapters/out/database/PostgresSagaRepository.js';
import { Saga } from '../../../src/domain/entities/Saga.js';
import database from '../../../src/infrastructure/config/database.js';

describe('Integração: PostgresSagaRepository', () => {
  let repository;

  beforeAll(async () => {
    repository = new PostgresSagaRepository();
  });

  afterEach(async () => {
    // Limpar as tabelas após cada teste para garantir isolamento
    await database.query('TRUNCATE orquestrador.saga_passos, orquestrador.sagas;');
  });

  afterAll(async () => {
    await database.pool.end();
  });

  it('deve salvar uma saga concluída junto com seus passos e conseguir buscá-la', async () => {
    const saga = new Saga({ tipo: 'REGISTRAR_DESPESA', payload: { viagemId: 'v-1' } });
    saga.registrarPasso('REGISTRAR_DESPESA', 'SUCESSO', { despesaId: 'd-1' });
    saga.concluir({ despesaId: 'd-1' });

    await repository.salvar(saga);

    const encontrada = await repository.buscarPorId(saga.id);

    expect(encontrada).not.toBeNull();
    expect(encontrada.sag_status).toBe('CONCLUIDA');
    expect(encontrada.sag_tipo).toBe('REGISTRAR_DESPESA');
    expect(encontrada.passos).toHaveLength(1);
    expect(encontrada.passos[0].pas_nome).toBe('REGISTRAR_DESPESA');
    expect(encontrada.passos[0].pas_status).toBe('SUCESSO');
  });

  it('deve retornar null quando a saga não existe', async () => {
    const encontrada = await repository.buscarPorId('00000000-0000-0000-0000-000000000000');

    expect(encontrada).toBeNull();
  });
});
