import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';
import openapi from './docs/openapi.js';

import errorMiddleware from './infrastructure/middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

// Swagger só existe quando SWAGGER_ENABLED=true (DEV). Em HOMOL a rota nem é criada.
if (process.env.SWAGGER_ENABLED === 'true') {
    app.get('/api-docs.json', (_req, res) => res.json(openapi));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
}

app.use(errorMiddleware);

export default app;
