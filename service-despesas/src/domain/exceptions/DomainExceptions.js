import AppError from '../../infrastructure/exceptions/AppError.js';

class DomainException extends AppError {
  constructor(message) {
    // Passa a mensagem e força o statusCode 400
    super(message, 400);
  }
}

export { DomainException };
export default DomainException;