import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/usuario.service.js";
import * as dto from "../../dto/usuario.dto.js";

describe("Listar usuários", () => {
    it('service deve trazer lista de usuários', async () => {
        const fake_repo = { listar: vi.fn().mockResolvedValue({ rows: "" }) }
        const service = criarService(fake_repo)

        const res = await service.listar()

        expect(res).toHaveProperty('rows')
    })
})

describe("Criar usuário", () => {
    const valid_data = {
        usu_nome: `test_user_${Date.now()}`,
        usu_email: `test_user@email.teste`,
        usu_password: "test_user123!"
    }

    it("deve criar usuario", async () => {
        const fake_repo = {
            criarUsuario: vi.fn().mockResolvedValue({ ...valid_data }),
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 0 })
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...valid_data }));

        expect(res).toHaveProperty("jwt");
    })

    it("deve validar criar usuario", async () => {
        let res = await captureAppError(() => dto.criarDto({ campo_extra: "deve ser ignorado", ...valid_data }));

        expect(res).toStrictEqual(valid_data);
    })

    it("deve falhar por e-mail já utilizado", async () => {
        const fake_repo = {
            criarUsuario: vi.fn().mockResolvedValue({ ...valid_data }),
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 1 })
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...valid_data }));

        expect(res.status).toBe(409);
    })

    it("deve falhar por e-mail inválido", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_email: "invalido" }));

        expect(res[0].format).toBe('email');
    })

    it("deve falhar por nome muito grande", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: "testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" }));

        expect(res[0].code).toBe('too_big');
    })

    describe("deve falhar por senha inválida", () => {
        it("falha por senha menor de 8 dígios", async () => {
            const password = 'senha1!';

            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_password: password }));

            expect(res[0].code).toBe('too_small');
        })

        it("falha por senha sem letras", async () => {
            const password = '123456789!';

            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_password: password }));

            expect(res[0].code).toBe('invalid_format');
        })

        it("falha por senha sem números", async () => {
            const password = 'abcdefghijklmnopqrst!';

            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_password: password }));

            expect(res[0].code).toBe('invalid_format');
        })

        it("falha por senha sem caractéres especiais", async () => {
            const password = 'senha1234';

            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_password: password }));

            expect(res[0].code).toBe('invalid_format');
        })
    })
})