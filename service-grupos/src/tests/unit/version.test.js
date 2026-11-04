import { describe, it, expect, afterEach } from '@jest/globals';
import { createRequire } from 'module';
import request from 'supertest';
import app from '../../app.js';

const { version } = createRequire(import.meta.url)('../../../package.json');

describe('Rota /version', () => {
    afterEach(() => {
        delete process.env.APP_VERSION;
        delete process.env.APP_COMMIT;
    });

    it('usa a versão do package.json quando a pipeline não informou', async () => {
        const res = await request(app).get('/api/v1/version');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ service: 'service-grupos', version, commit: null });
    });

    it('mostra a versão e o commit gravados pela pipeline', async () => {
        process.env.APP_VERSION = '9.9.9-dev';
        process.env.APP_COMMIT = 'abc123';

        const res = await request(app).get('/api/v1/version');

        expect(res.body).toEqual({ service: 'service-grupos', version: '9.9.9-dev', commit: 'abc123' });
    });

    it('é pública (não pede token)', async () => {
        const res = await request(app).get('/api/v1/version');

        expect(res.status).not.toBe(401);
    });
});
