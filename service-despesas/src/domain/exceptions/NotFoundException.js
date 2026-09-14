import AppError from './AppError.js';

class NotFoundException extends AppError {
  constructor(message = 'Recurso não encontrado') {
    // Passa a mensagem e força o statusCode 404
    super(message, 404);
  }
}

export { NotFoundException };
export default NotFoundException;