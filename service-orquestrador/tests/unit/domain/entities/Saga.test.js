import { Saga } from '../../../../src/domain/entities/Saga.js';

describe('Entity: Saga', () => {
  it('deve iniciar com status INICIADA e sem passos', () => {
    const saga = new Saga({ tipo: 'REGISTRAR_DESPESA', payload: { viagemId: 'v-1' } });

    expect(saga.status).toBe('INICIADA');
    expect(saga.resultado).toBeNull();
    expect(saga.passos).toEqual([]);
    expect(saga.id).toBeDefined();
  });

  it('deve acumular passos registrados', () => {
    const saga = new Saga({ tipo: 'REGISTRAR_DESPESA', payload: {} });

    saga.registrarPasso('REGISTRAR_DESPESA', 'SUCESSO', { despesaId: 'd-1' });

    expect(saga.passos).toHaveLength(1);
    expect(saga.passos[0]).toEqual({
      nome: 'REGISTRAR_DESPESA',
      status: 'SUCESSO',
      detalhe: { despesaId: 'd-1' }
    });
  });

  it('deve concluir marcando status CONCLUIDA e guardando o resultado', () => {
    const saga = new Saga({ tipo: 'REGISTRAR_DESPESA', payload: {} });

    saga.concluir({ despesaId: 'd-1' });

    expect(saga.status).toBe('CONCLUIDA');
    expect(saga.resultado).toEqual({ despesaId: 'd-1' });
  });

  it('deve falhar marcando status FALHA e guardando o motivo', () => {
    const saga = new Saga({ tipo: 'REGISTRAR_DESPESA', payload: {} });

    saga.falhar({ motivo: 'VIAGEM_NAO_ENCONTRADA' });

    expect(saga.status).toBe('FALHA');
    expect(saga.resultado).toEqual({ motivo: 'VIAGEM_NAO_ENCONTRADA' });
  });
});
