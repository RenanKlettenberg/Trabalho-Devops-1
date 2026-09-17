import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import pool from '../../infrastructure/database/connection.js';
import gerarToken from '../utils/token.util.js';

describe('Participante - integração', () => {
    let tokenDono;
    let gru_id;

    beforeAll(async () => {
        const usu_id = Date.now() % 1000000;
        tokenDono = gerarToken({ usu_id, usu_nome: 'Dono', usu_plano: 'free' });

        const grupo = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${tokenDono}`)
            .send({ gru_nome: `Grupo ${usu_id}` });

        gru_id = grupo.body.payload.gru_id;
    });

    afterAll(async () => {
        await pool.end();
    });

    it('cria participantes até o limite do plano free (5) e bloqueia o 6º com 409', async () => {
        for (let i = 1; i <= 5; i++) {
            const res = await request(app)
                .post('/api/v1/participante')
                .set('Authorization', `Bearer ${tokenDono}`)
                .send({ gru_id, par_nome: `Participante ${i}` });

            expect(res.status).toBe(200);
        }

        const sexto = await request(app)
            .post('/api/v1/participante')
            .set('Authorization', `Bearer ${tokenDono}`)
            .send({ gru_id, par_nome: 'Participante 6' });

        expect(sexto.status).toBe(409);
        expect(sexto.body.code).toBe('GRU01');
    });

    it('lista os participantes do grupo', async () => {
        const res = await request(app)
            .get(`/api/v1/participante/grupo/${gru_id}`)
            .set('Authorization', `Bearer ${tokenDono}`);

        expect(res.status).toBe(200);
        expect(res.body.payload.length).toBe(5); // os 5 que couberam no teste anterior
    });

    it('retorna 404 ao editar um participante inexistente', async () => {
        const res = await request(app)
            .put('/api/v1/participante/999999')
            .set('Authorization', `Bearer ${tokenDono}`)
            .send({ par_nome: 'X' });

        expect(res.status).toBe(404);
    });
});
