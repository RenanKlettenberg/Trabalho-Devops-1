const express = require('express');

module.exports = (moedaController) => {
  const router = express.Router();
  router.get('/', (req, res, next) => moedaController.listar(req, res, next));
  return router;
};