import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import promBundle from 'express-prom-bundle';
import errorMiddleware from './infrastructure/middlewares/error.middleware.js';

const app = express();

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