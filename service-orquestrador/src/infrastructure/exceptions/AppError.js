class AppError extends Error {
  constructor(mensagem, statusCode = 400) {
    super(mensagem);
    this.statusCode = statusCode;
    this.isOperational = true; // Indica que foi um erro previsto pela aplicação
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
export default AppError;
