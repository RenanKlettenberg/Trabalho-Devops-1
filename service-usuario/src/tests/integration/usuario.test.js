import { describe, it, expect } from 'vitest';
import api from "../../shared/utils/api.request.js"

describe("Criar usuário", () => {
    const nome_test = `test_user_${Date.now()}`

    it("deve retonar 200 - SUCESSO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.post('3000', 'usuario/', data);

        expect(res.status).toBe(200)
    })

    it("deve retonar 200 - SUCESSO com plano 'premium'", async () => {
        const nome = `${nome_test}_premium`
        const data = {
            usu_nome: nome,
            usu_email: `${nome}@email.teste`,
            usu_password: `${nome}!`,
            usu_plano: 'premium',
        }

        const res = await api.post('3000', 'usuario/', data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 409 - USUARIO JÁ CADASTRADO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.post('3000', 'usuario/', data);

        expect(res.status).toBe(409)
    })

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.post('3000', 'usuario/', {});

        expect(res.status).toBe(400)
    })

    it("deve retornar 400 - PLANO INVÁLIDO", async () => {
        const nome = `${nome_test}_plano_invalido`
        const data = {
            usu_nome: nome,
            usu_email: `${nome}@email.teste`,
            usu_password: `${nome}!`,
            usu_plano: 'vip',
        }

        const res = await api.post('3000', 'usuario/', data);

        expect(res.status).toBe(400)
    })
})

describe("Editar usuário", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = { usu_nome: "Usuário fixture (editado)" }

        const res = await api.put('3000', 'usuario/100', data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 200 - SUCESSO ao alterar plano para 'premium'", async () => {
        const data = { usu_plano: 'premium' }

        const res = await api.put('3000', 'usuario/100', data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.put('3000', 'usuario/abc', {}); // id inválido

        expect(res.status).toBe(400)
    })

    it("deve retornar 400 - PLANO INVÁLIDO", async () => {
        const res = await api.put('3000', 'usuario/100', { usu_plano: 'vip' });

        expect(res.status).toBe(400)
    })

    it("deve retornar 404 - NÃO ENCONTRADO", async () => {
        const data = { usu_nome: "Usuário inexistente" }

        const res = await api.put('3000', 'usuario/999999', data);

        expect(res.status).toBe(404)
    })
})

describe("Deletar usuário", () => {
    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.delete('3000', 'usuario/abc'); 

        expect(res.status).toBe(400)
    })

    it("deve retornar 404 - NÃO ENCONTRADO", async () => {
        const res = await api.delete('3000', 'usuario/999999');

        expect(res.status).toBe(404)
    })

    it("deve retornar 200 - SUCESSO", async () => {
        const res = await api.delete('3000', 'usuario/100');

        expect(res.status).toBe(200)
    })
})