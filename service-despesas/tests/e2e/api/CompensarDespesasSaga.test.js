import { jest } from '@jest/globals';
import { CompensarDespesasCommandHandler } from '../../../src/infrastructure/adapters/in/messaging/listeners/CompensarDespesasCommandHandler.js';
import { PostgresDespesaRepository } from '../../../src/infrastructure/adapters/out/database/PostgresDespesaRepository.js';
import { Despesa } from '../../../src/domain/entities/Despesa.js';
import database from '../../../src/infrastructure/config/database.js';

describe('E2E: Saga Orquestrado - Handler de Compensação', () => {
  let handler;
  let repository;
  let mockPublisher; // Mockamos apenas a devolução para a fila do orquestrador para facilitar o teste

  beforeAll(async () => {
    repository = new PostgresDespesaRepository();
    mockPublisher = { publicar: jest.fn().mockResolvedValue(true) };
    handler = new CompensarDespesasCommandHandler(repository, mockPublisher);
  });

  afterEach(async () => {
    await database.query('TRUNCATE despesas.despesas;');
  });

  afterAll(async () => {
    await database.pool.end();
  });

  it('deve processar o comando do orquestrador, estornar as despesas e enviar a resposta', async () => {
    // 1. Prepara o banco com uma despesa associada a um evento
    const despesa = new Despesa({ descricao: 'Hotel', valor: 300, moeda: 'BRL', categoria: 'HOSPEDAGEM', viagemId: 'v-1' });
    despesa.eventoId = 'evento-505'; 
    await repository.salvar(despesa);

    // 2. Simula a chegada do comando na fila
    const comandoSaga = {
      properties: { correlationId: 'saga-abc-123', replyTo: 'orquestrador_respostas_queue' },
      content: Buffer.from(JSON.stringify({ comando: 'COMPENSAR_DESPESAS', eventoId: 'evento-505' }))
    };

    // 3. O Handler processa a mensagem
    await handler.processarComando(comandoSaga);

    // 4. Verifica se o banco de dados foi alterado
    const despesasAtualizadas = await repository.buscarPorEventoId('evento-505');
    expect(despesasAtualizadas[0].status).toBe('ESTORNADA');

    // 5. Verifica se respondeu ao orquestrador
    expect(mockPublisher.publicar).toHaveBeenCalledWith(
      'orquestrador_respostas_queue', 
      expect.objectContaining({ status: 'SUCESSO', sagaId: 'saga-abc-123' })
    );
  });
});