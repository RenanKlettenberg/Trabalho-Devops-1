import { jest } from '@jest/globals';
import { DespesaController } from '../../../../../../../src/infrastructure/adapters/in/http/controllers/Despesa.Controller.js';

function criarResposta() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Controller: Despesa', () => {
  describe('criar', () => {
    it('deve retornar 201 com a despesa criada', async () => {
      const despesaCriada = { id: 'd-1', status: 'ATIVA' };
      const mockCommand = { execute: jest.fn().mockResolvedValue(despesaCriada) };
      const controller = new DespesaController(mockCommand, {});

      const req = { body: { valor: 50, descricao: 'Táxi', categoria: 'TRANSPORTE', moeda: 'BRL', viagemId: 'v-1' } };
      const res = criarResposta();

      await controller.criar(req, res);

      expect(mockCommand.execute).toHaveBeenCalledWith({
        valor: 50,
        descricao: 'Táxi',
        categoria: 'TRANSPORTE',
        moeda: 'BRL',
        viagemId: 'v-1',
        eventoId: undefined
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(despesaCriada);
    });

    it('deve retornar 400 quando o command falha (ex: valor inválido)', async () => {
      const mockCommand = { execute: jest.fn().mockRejectedValue(new Error('O valor da despesa deve ser maior que zero')) };
      const controller = new DespesaController(mockCommand, {});

      const req = { body: { valor: -10 } };
      const res = criarResposta();

      await controller.criar(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ erro: 'O valor da despesa deve ser maior que zero' });
    });
  });

  describe('obterPorId', () => {
    it('deve retornar 200 com a despesa encontrada', async () => {
      const despesa = { id: 'd-1', descricao: 'Táxi' };
      const mockQuery = { execute: jest.fn().mockResolvedValue(despesa) };
      const controller = new DespesaController({}, mockQuery);

      const req = { params: { id: 'd-1' } };
      const res = criarResposta();

      await controller.obterPorId(req, res);

      expect(mockQuery.execute).toHaveBeenCalledWith('d-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(despesa);
    });

    it('deve retornar 404 quando a despesa não existe', async () => {
      const mockQuery = { execute: jest.fn().mockResolvedValue(null) };
      const controller = new DespesaController({}, mockQuery);

      const req = { params: { id: 'inexistente' } };
      const res = criarResposta();

      await controller.obterPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Despesa não encontrada' });
    });

    it('deve retornar 500 quando a query falha', async () => {
      const mockQuery = { execute: jest.fn().mockRejectedValue(new Error('Banco fora do ar')) };
      const controller = new DespesaController({}, mockQuery);

      const req = { params: { id: 'd-1' } };
      const res = criarResposta();

      await controller.obterPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ erro: 'Banco fora do ar' });
    });
  });
});
