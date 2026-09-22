import Despesa from '../../../../src/domain/entities/Despesa.js';
import {
  ValorInvalidoException,
  DespesaJaEstornadaException,
} from '../../../../src/domain/exceptions/DomainExceptions.js';

const dadosValidos = {
  descricao: 'Jantar',
  valor: 100,
  moeda: 'USD',
  categoria: 'ALIMENTACAO',
  viagemId: 'v1',
};

describe('Despesa', () => {
  it('cria uma despesa ATIVA com id e timestamps gerados', () => {
    const despesa = Despesa.registrar(dadosValidos);

    expect(despesa.id).toBeDefined();
    expect(despesa.status).toBe('ATIVA');
    expect(despesa.estaAtiva()).toBe(true);
    expect(despesa.moeda.codigo).toBe('USD');
    expect(despesa.categoria.valor).toBe('ALIMENTACAO');
    expect(despesa.createdAt).toBeInstanceOf(Date);
  });

  it.each([0, -10, 'abc', undefined, null])('rejeita valor inválido: %p', (valor) => {
    expect(() => Despesa.registrar({ ...dadosValidos, valor })).toThrow(ValorInvalidoException);
  });

  it('aceita eventoId opcional e o normaliza para string', () => {
    const despesa = Despesa.registrar({ ...dadosValidos, eventoId: 123 });
    expect(despesa.eventoId).toBe('123');
  });

  it('estorna uma despesa ativa e atualiza updatedAt', () => {
    const despesa = Despesa.registrar(dadosValidos);
    const updatedAtOriginal = despesa.updatedAt;

    despesa.estornar();

    expect(despesa.status).toBe('ESTORNADA');
    expect(despesa.estaAtiva()).toBe(false);
    expect(despesa.updatedAt.getTime()).toBeGreaterThanOrEqual(updatedAtOriginal.getTime());
  });

  it('não permite estornar uma despesa já estornada', () => {
    const despesa = Despesa.registrar(dadosValidos);
    despesa.estornar();

    expect(() => despesa.estornar()).toThrow(DespesaJaEstornadaException);
  });
});
