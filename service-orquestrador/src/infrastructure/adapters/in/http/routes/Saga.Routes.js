import express from 'express';
import SagaController from '../controllers/Saga.Controller.js';

export default (registrarDespesaSaga, cancelarDespesaSaga, sagaRepository) => {
  const router = express.Router();
  const sagaController = new SagaController(registrarDespesaSaga, cancelarDespesaSaga, sagaRepository);

  router.post('/despesas', (req, res) => sagaController.registrarDespesa(req, res));
  router.post('/despesas/:eventoId/cancelar', (req, res) => sagaController.cancelarDespesa(req, res));
  router.get('/:id', (req, res) => sagaController.obterPorId(req, res));

  return router;
};
