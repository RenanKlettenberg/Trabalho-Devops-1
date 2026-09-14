import express from 'express';

export default (categoriaController) => {
  const router = express.Router();
  router.get('/', (req, res, next) => categoriaController.listar(req, res, next));
  return router;
};