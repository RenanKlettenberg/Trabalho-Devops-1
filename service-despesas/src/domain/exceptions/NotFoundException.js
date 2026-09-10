const AppError = require('./AppError');

class NotFoundException extends AppError {
  constructor(message = 'Recurso não encontrado') {
    // Passa a mensagem e força o statusCode 404
    super(message, 404);
  }
}

module.exports = NotFoundException;