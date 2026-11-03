import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import promBundle from 'express-prom-bundle';
import errorMiddleware from './infrastructure/middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './infrastructure/config/swagger.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(cors());
app.use(express.json());

app.use(promBundle({
    includeMethod: true,
    includePath: true,
    promClient: {
        collectDefaultMetrics: {},
    },
}));

app.use('/api/v1', routes);
app.use(errorMiddleware);

export default app;