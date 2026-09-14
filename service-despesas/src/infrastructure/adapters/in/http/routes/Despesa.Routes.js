import express from 'express';
import DespesaController from '../controllers/Despesa.Controller.js';

// Nota: Em uma aplicação real, a injeção de dependências seria feita por um container (ex: Awilix, Inversify)
export default (criarDespesaCommand, obterDespesaQuery) => {
  const router = express.Router();
  const despesaController = new DespesaController(criarDespesaCommand, obterDespesaQuery);

  router.post('/', (req, res) => despesaController.criar(req, res));
  router.get('/:id', (req, res) => despesaController.obterPorId(req, res));

  return router;
};