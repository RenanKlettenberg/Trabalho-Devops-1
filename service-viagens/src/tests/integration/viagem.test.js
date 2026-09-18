import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/viagem.service.js";
import * as dto from "../../dto/viagem.dto.js";

describe("Criar viagem", () => {
    const body_cliente = {
        via_nome: "Viagem de teste",
        via_data_ini: "11-13-2113 13:13",
        via_data_fim: "12-31-2113 13:13",
        gru_id: 1,
        usu_id: 1,
    }

    it("deve criar viagem", async () => {
        const fake_repo = {
            criarViagem: vi.fn().mockResolvedValue({ via_id: 1, ...body_cliente }),
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(0),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarViagem({ ...body_cliente }));

        expect(res).toHaveProperty("via_id");
    })

    it("deve validar criar viagem", async () => {
        let res = await captureAppError(() => dto.criarDto({ campo_extra: "deve ser ignorado", ...body_cliente }));

        expect(res).toStrictEqual({
            ...body_cliente,
            via_data_ini: new Date(body_cliente.via_data_ini),
            via_data_fim: new Date(body_cliente.via_data_fim),
        });
    })

    it("deve falhar por não informar usuário", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...body_cliente, usu_id: undefined }));

        expect(res[0].path).toContain('usu_id');
    })

    describe("Deve falhar por data inválida", () => {
        it("falha por nome da viagem muito longo", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...body_cliente, via_nome: "a".repeat(300) }));

            expect(res[0].code).toBe('too_big');
        })

        it("falha por informar só uma das datas da viagem", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...body_cliente, via_data_fim: undefined }));

            expect(res[0].path).toContain('via_data_fim');
        })

        it("falha por data do fim anteceder a data de início", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...body_cliente, via_data_fim: "01-01-2000 00:00" }));

            expect(res[0].code).toBe('custom');
        })
    })
})

describe("Criar viagem - limite do plano", () => {
    it("deve falhar por exceder limite de viagens ativas do plano", async () => {
        const fake_repo = {
            criarViagem: vi.fn(),
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(3),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarViagem({
            via_nome: "Viagem excedente",
            via_data_ini: "11-13-2113 13:13",
            via_data_fim: "12-31-2113 13:13",
            usu_id: 1,
            usu_plano: "free",
            gru_id: 1,
        }));

        expect(res.status).toBe(409);
    })

    it("deve permitir criar viagem dentro do limite do plano 'premium'", async () => {
        const fake_repo = {
            criarViagem: vi.fn().mockResolvedValue({ via_id: 10 }),
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(3),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarViagem({
            via_nome: "Viagem dentro do limite",
            via_data_ini: "11-13-2113 13:13",
            via_data_fim: "12-31-2113 13:13",
            usu_id: 1,
            usu_plano: "premium",
            gru_id: 1,
        }));

        expect(res).toHaveProperty("via_id");
    })
})

describe("Editar viagem", () => {
    const body_cliente = {
        via_id: 1,
        usu_id: 1,
        via_nome: "Viagem editada",
        via_data_ini: "11-13-2113 13:13",
        via_data_fim: "12-31-2113 13:13",
    }

    it("deve editar viagem", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ via_id: 1, usu_id: 1 }),
            editarViagem: vi.fn().mockResolvedValue({ ...body_cliente }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarViagem({ ...body_cliente }));

        expect(res).toHaveProperty("via_id");
        expect(fake_repo.getById).toHaveBeenCalledWith(body_cliente.via_id, body_cliente.usu_id);
    })

    it("deve validar editar viagem", async () => {
        let res = await captureAppError(() => dto.editarDto({ campo_extra: "deve ser ignorado", ...body_cliente }));

        expect(res).toStrictEqual({
            ...body_cliente,
            via_data_ini: new Date(body_cliente.via_data_ini),
            via_data_fim: new Date(body_cliente.via_data_fim),
        });
    })

    it("deve falhar por viagem não encontrada (ou não pertencente ao usuário)", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            editarViagem: vi.fn(),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.editarViagem({ ...body_cliente }));

        expect(res.status).toBe(404);
        expect(fake_repo.editarViagem).not.toHaveBeenCalled();
    })

    it("deve falhar por data do fim anteceder a data de início", async () => {
        let res = await captureAppError(() => dto.editarDto({ ...body_cliente, via_data_fim: "01-01-2000 00:00" }));

        expect(res[0].code).toBe('custom');
    })
})

describe("Deletar viagem", () => {
    it("deve deletar viagem", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({ via_id: 1, usu_id: 1 }),
            deletarViagem: vi.fn().mockResolvedValue({ via_id: 1 }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.deletarViagem({ via_id: 1, usu_id: 1 }));

        expect(res).toHaveProperty("via_id");
        expect(fake_repo.getById).toHaveBeenCalledWith(1, 1);
    })

    it("deve falhar por viagem não encontrada (ou não pertencente ao usuário)", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            deletarViagem: vi.fn(),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.deletarViagem({ via_id: 999, usu_id: 1 }));

        expect(res.status).toBe(404);
        expect(fake_repo.deletarViagem).not.toHaveBeenCalled();
    })
})

describe("Listar viagens", () => {
    it("deve listar viagens do usuário", async () => {
        const fake_repo = {
            listar: vi.fn().mockResolvedValue([{ via_id: 1 }, { via_id: 2 }]),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.listar({ usu_id: 1 }));

        expect(res.length).toBe(2);
    })
})