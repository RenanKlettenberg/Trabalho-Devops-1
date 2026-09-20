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

    it("deve criar usuário", async () => {
        const fake_repo = {
            criarUsuario: vi.fn().mockResolvedValue({ ...valid_data }),
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 0 })
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...valid_data }));

        expect(res).toHaveProperty("jwt");
    })

    it("deve criar usuário com plano 'free' (padrão)", async () => {
        const dados = { ...valid_data, usu_plano: 'free' };
        const fake_repo = {
            criarUsuario: vi.fn().mockResolvedValue({ ...dados }),
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 0 })
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...dados }));

        expect(res.usu_plano).toBe('free');
        expect(fake_repo.criarUsuario).toHaveBeenCalledWith(expect.objectContaining({ usu_plano: 'free' }));
    })

    it("deve criar usuário com plano 'premium'", async () => {
        const dados = { ...valid_data, usu_plano: 'premium' };
        const fake_repo = {
            criarUsuario: vi.fn().mockResolvedValue({ ...dados }),
            getByEmail: vi.fn().mockResolvedValue({ rowCount: 0 })
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...dados }));

        expect(res.usu_plano).toBe('premium');
        expect(fake_repo.criarUsuario).toHaveBeenCalledWith(expect.objectContaining({ usu_plano: 'premium' }));
    })

    it("deve validar criar usuário", async () => {
        let res = await captureAppError(() => dto.criarDto({ campo_extra: "deve ser ignorado", ...valid_data }));

        expect(res).toStrictEqual({ ...valid_data, usu_plano: 'free' });
    })

    it("deve aplicar plano padrão 'free' quando não informado", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data }));

        expect(res.usu_plano).toBe('free');
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

    it("deve falhar por não informar nome", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: undefined }));

        expect(res[0].path).toContain('usu_nome');
    })

    it("deve falhar por não informar e-mail", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_email: undefined }));

        expect(res[0].path).toContain('usu_email');
    })

    it("deve falhar por não informar senha", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_password: undefined }));

        expect(res[0].path).toContain('usu_password');
    })

    it("deve falhar por e-mail inválido", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_email: "invalido" }));

        expect(res[0].format).toBe('email');
    })

    it("deve falhar por nome muito grande", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: "a".repeat(300) }));

        expect(res[0].code).toBe('too_big');
    })

    it("deve falhar por plano inválido", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_plano: 'vip' }));

        expect(res[0].code).toBe('custom');
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

describe("Editar usuário", () => {
    const body_cliente = {
        usu_id: 1,
        usu_nome: "Usuário Editado",
        usu_email: "editado@email.teste",
    }

    it("deve editar usuário", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ usu_id: 1, usu_email: "antigo@email.teste" }),
            editarUsuario: vi.fn().mockResolvedValue({ ...body_cliente }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarUsuario({ ...body_cliente }));

        expect(res).toHaveProperty("usu_id");
        expect(fake_repo.getById).toHaveBeenCalledWith(body_cliente.usu_id);
    })

    it("deve validar editar usuário", async () => {
        let res = await captureAppError(() => dto.editarDto({ campo_extra: "deve ser ignorado", ...body_cliente }));

        expect(res).toStrictEqual(body_cliente);
    })

    it("deve alterar plano de 'free' para 'premium'", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ usu_id: 1, usu_plano: 'free' }),
            editarUsuario: vi.fn().mockResolvedValue({ usu_id: 1, usu_plano: 'premium' }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarUsuario({ usu_id: 1, usu_plano: 'premium' }));

        expect(res.usu_plano).toBe('premium');
    })

    it("deve alterar plano de 'premium' para 'free'", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ usu_id: 1, usu_plano: 'premium' }),
            editarUsuario: vi.fn().mockResolvedValue({ usu_id: 1, usu_plano: 'free' }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarUsuario({ usu_id: 1, usu_plano: 'free' }));

        expect(res.usu_plano).toBe('free');
    })

    it("deve falhar por usuário não encontrado", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            editarUsuario: vi.fn(),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarUsuario({ ...body_cliente }));

        expect(res.status).toBe(404);
        expect(fake_repo.editarUsuario).not.toHaveBeenCalled();
    })

    it("deve falhar por plano inválido", async () => {
        let res = await captureAppError(() => dto.editarDto({ ...body_cliente, usu_plano: 'vip' }));

        expect(res[0].code).toBe('custom');
    })
})

describe("Deletar usuário", () => {
    it("deve deletar usuário", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ usu_id: 1 }),
            deletarUsuario: vi.fn().mockResolvedValue({ usu_id: 1 }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.deletarUsuario({ usu_id: 1 }));

        expect(res).toHaveProperty("usu_id");
        expect(fake_repo.getById).toHaveBeenCalledWith(1);
    })

    it("deve falhar por usuário não encontrado", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            deletarUsuario: vi.fn(),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.deletarUsuario({ usu_id: 999 }));

        expect(res.status).toBe(404);
        expect(fake_repo.deletarUsuario).not.toHaveBeenCalled();
    })
})