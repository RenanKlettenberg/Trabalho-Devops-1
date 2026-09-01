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
    
    it("deve retornar 409 - USUARIO JÁ CADASTRADO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.post('3000', 'usuario/', data);

        expect(res.status).toBe(409)
    })

    it("deve retornar 400 - DADA INVÁLIDO", async () => {
        const res = await api.post('3000', 'usuario/', {});

        expect(res.status).toBe(400)
    })
})