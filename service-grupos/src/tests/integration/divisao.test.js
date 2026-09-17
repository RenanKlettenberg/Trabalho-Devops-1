import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import pool from '../../infrastructure/database/connection.js';
import gerarToken from '../utils/token.util.js';

describe('Divisão de despesa - integração ponta a ponta', () => {
    let token;
    let gru_id;
    let par_id_1;
    let par_id_2;

    beforeAll(async () => {
        const usu_id = Date.now() % 1000000;
        token = gerarToken({ usu_id, usu_nome: 'Dono', usu_plano: 'free' });

        const grupo = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${token}`)
            .send({ gru_nome: `Grupo Divisao ${usu_id}` });
        gru_id = grupo.body.payload.gru_id;

        const p1 = await request(app)
            .post('/api/v1/participante')
            .set('Authorization', `Bearer ${token}`)
            .send({ gru_id, par_nome: 'Ana' });
        par_id_1 = p1.body.payload.par_id;

        const p2 = await request(app)
            .post('/api/v1/participante')
            .set('Authorization', `Bearer ${token}`)
            .send({ gru_id, par_nome: 'Bruno' });
        par_id_2 = p2.body.payload.par_id;
    });

    afterAll(async () => {
        await pool.end();
    });

    it('sem nenhum vínculo, divide igualmente entre os participantes do grupo', async () => {
        const res = await request(app)
            .post(`/api/v1/grupo/${gru_id}/despesa/1/divisao`)
            .set('Authorization', `Bearer ${token}`)
            .send({ valor: 100 });

        expect(res.status).toBe(200);
        expect(res.body.payload).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ par_id: par_id_1, valor_devido: 50 }),
                expect.objectContaining({ par_id: par_id_2, valor_devido: 50 }),
            ])
        );
    });

    it('marcando a despesa como exclusiva de um participante, só ele entra na divisão', async () => {
        await request(app)
            .post('/api/v1/despesa-participante')
            .set('Authorization', `Bearer ${token}`)
            .send({ des_id: 2, par_id: par_id_1, dp_exclusiva: true });

        const res = await request(app)
            .post(`/api/v1/grupo/${gru_id}/despesa/2/divisao`)
            .set('Authorization', `Bearer ${token}`)
            .send({ valor: 80 });

        expect(res.status).toBe(200);
        expect(res.body.payload).toEqual([
            expect.objectContaining({ par_id: par_id_1, valor_devido: 80 }),
        ]);
    });
});
