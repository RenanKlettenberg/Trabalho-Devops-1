import express from 'express';
// Importar rotas (Exemplo usando o index criado anteriormente)
// As rotas sao registradas aqui quando os controllers estiverem configurados.
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Middlewares globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ponto de entrada das rotas (injeção deve acontecer com os controllers configurados)
// app.use('/api', apiRoutes(controllers));

// Middleware de tratamento de erros (deve ser sempre o último 'use')
app.use(errorMiddleware);

export { app };
export default app;