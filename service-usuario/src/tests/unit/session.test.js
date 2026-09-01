import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/session.service.js";
import * as dto from "../../dto/session.dto.js";

describe("Fazer login", () => {
    const valid_data = {
        usu_email: `test_user@email.teste`,
        usu_password: "test_user123!"
    }

    it("deve falhar por usuário não encontrado", async () => {
        const fake_usuario_repo = {
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 0 })
        }
        const service = criarService(fake_usuario_repo);

        let res = await captureAppError(async () => await service.login({ ...valid_data }));

        expect(res.status).toBe(401);
    })

    it("deve falhar por email inválido", async () => {
        const email = 'email_invalido';

        let res = await captureAppError(() => dto.loginDto({ ...valid_data, usu_email: email }));

        expect(res[0]?.format).toBe('email');
    })
})