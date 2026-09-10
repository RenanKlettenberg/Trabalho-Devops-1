const AppError = require('../../infrastructure/exceptions/AppError');

class DomainException extends AppError {
  constructor(message) {
    // Passa a mensagem e força o statusCode 400
    super(message, 400);
  }
}

module.exports = DomainException;