import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

describe('Métricas do Prometheus', () => {
    it('expõe as métricas em /metrics', async () => {
        await request(app).get('/api/v1/health');

        const res = await request(app).get('/metrics');

        expect(res.status).toBe(200);
        expect(res.text).toContain('http_request_duration_seconds');
        expect(res.text).toContain('process_resident_memory_bytes');
    });
});
