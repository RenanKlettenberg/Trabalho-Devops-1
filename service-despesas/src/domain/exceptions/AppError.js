class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    
    // Captura a stack trace limitando a exibição apenas de onde o erro ocorreu
    // Isso evita vazar informações internas do Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;