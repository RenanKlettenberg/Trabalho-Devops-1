const express = require('express');

module.exports = (dashboardController) => {
  const router = express.Router();

  router.get('/financeiro', (req, res, next) => dashboardController.obterResumo(req, res, next));

  return router;
};