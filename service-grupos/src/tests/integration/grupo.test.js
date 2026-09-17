import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import pool from '../../infrastructure/database/connection.js';
import gerarToken from '../utils/token.util.js';

// PRÉ-REQUISITO pra rodar este arquivo: um Postgres real acessível com as
// variáveis DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD já configuradas
// (via .env ou exportadas no shell) e o init.sql já executado nesse banco.
describe('Grupo - integração', () => {
    let usuarioDono;
    let usuarioOutro;

    beforeAll(() => {
        const usu_id = Date.now() % 1000000;
        usuarioDono = gerarToken({ usu_id, usu_nome: 'Dono', usu_plano: 'free' });
        usuarioOutro = gerarToken({ usu_id: usu_id + 1, usu_nome: 'Outro', usu_plano: 'free' });
    });

    afterAll(async () => {
        await pool.end();
    });

    it('cria um grupo com sucesso (200) e o dono vem do token, não do body', async () => {
        const res = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${usuarioDono}`)
            .send({ gru_nome: 'Grupo Teste', usu_id_dono: 999999 });

        expect(res.status).toBe(200);
        expect(res.body.payload.gru_nome).toBe('Grupo Teste');
        expect(res.body.payload.usu_id_dono).not.toBe(999999);
    });

    it('retorna 400 quando falta o gru_nome', async () => {
        const res = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${usuarioDono}`)
            .send({});

        expect(res.status).toBe(400);
    });

    it('retorna 401 quando não manda token nenhum', async () => {
        const res = await request(app)
            .post('/api/v1/grupo')
            .send({ gru_nome: 'Sem token' });

        expect(res.status).toBe(401);
    });

    it('bloqueia edição por quem não é dono do grupo (403)', async () => {
        const criado = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${usuarioDono}`)
            .send({ gru_nome: 'Grupo do Dono' });
        const gru_id = criado.body.payload.gru_id;

        const res = await request(app)
            .put(`/api/v1/grupo/${gru_id}`)
            .set('Authorization', `Bearer ${usuarioOutro}`)
            .send({ gru_nome: 'Tentativa de invasão' });

        expect(res.status).toBe(403);
    });

    it('permite edição pelo próprio dono (200)', async () => {
        const criado = await request(app)
            .post('/api/v1/grupo')
            .set('Authorization', `Bearer ${usuarioDono}`)
            .send({ gru_nome: 'Grupo Editável' });
        const gru_id = criado.body.payload.gru_id;

        const res = await request(app)
            .put(`/api/v1/grupo/${gru_id}`)
            .set('Authorization', `Bearer ${usuarioDono}`)
            .send({ gru_nome: 'Nome Editado' });

        expect(res.status).toBe(200);
        expect(res.body.payload.gru_nome).toBe('Nome Editado');
    });
});
