import { describe, it, expect } from '@jest/globals';
import request from 'supertest';

process.env.SWAGGER_ENABLED = 'false';
const { default: app } = await import('../../app.js');

describe('Swagger desligado (HOMOL)', () => {
    it('não expõe a documentação', async () => {
        const res = await request(app).get('/api-docs.json');

        expect(res.status).toBe(404);
    });
});
