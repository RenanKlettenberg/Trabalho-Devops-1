import { describe, it, expect } from 'vitest';
import api from "../../shared/utils/api.request.js"

describe("Criar viagem", () => {
    it("deve retonar 200 - SUCESSO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.post('3001', 'viagem/', data);

        expect(res.status).toBe(200)
    })    

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.post('3001', 'viagem/', {});

        expect(res.status).toBe(400)
    })
})

describe("Editar viagem", () => {
    it("deve retonar 200 - SUCESSO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.put('3001', 'viagem/', data);

        expect(res.status).toBe(200)
    })    

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.put('3001', 'viagem/', {});

        expect(res.status).toBe(400)
    })
})

describe("Deletar viagem", () => {
    it("deve retonar 200 - SUCESSO", async () => {
        const data = {
            usu_nome: nome_test,
            usu_email: `${nome_test}@email.teste`,
            usu_password: `${nome_test}!`
        }

        const res = await api.delete('3001', 'viagem/', data);

        expect(res.status).toBe(200)
    })    

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.delete('3001', 'viagem/', {});

        expect(res.status).toBe(400)
    })
})