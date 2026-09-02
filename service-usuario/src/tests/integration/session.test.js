import { describe, it, expect } from 'vitest';
import api from "../../shared/utils/api.request.js"

describe("Fazer login", () => {
    const valid_data = {
        "usu_email": "test_user@teste.com",
        "usu_password": "senha_test123!"
    }

    it("deve retonar 200 - SUCESSO", async () => {
        const res = await api.post('3000', 'session/', valid_data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 401 - CREDENCIAIS INVÁLIDAS", async () => {
        const res = await api.post('3000', 'session/', { ...valid_data, usu_password: "12345678a!" });

        expect(res.status).toBe(401)
    })
})