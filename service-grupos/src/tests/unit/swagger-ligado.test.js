import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

// O app decide se cria a rota do Swagger no momento em que é importado,
// então a variável precisa estar definida antes do import.
process.env.SWAGGER_ENABLED = 'true';
const { default: app } = await import('../../app.js');

describe('Swagger ligado (DEV)', () => {
    it('serve a especificação OpenAPI em /api-docs.json', async () => {
        const res = await request(app).get('/api-docs.json');

        expect(res.status).toBe(200);
        expect(res.body.info.title).toBe('service-grupos');
    });

    it('serve a interface do Swagger em /api-docs/', async () => {
        const res = await request(app).get('/api-docs/');

        expect(res.status).toBe(200);
    });
});
