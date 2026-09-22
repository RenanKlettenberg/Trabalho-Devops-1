import { describe, it, expect, vi } from "vitest";
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/viagem.service.js";
import * as dto from "../../dto/viagem.dto.js";
import STATUS_VIAGEM from "../../shared/constants/viagem.constants.js";


describe("Listar viagem", () => {

    it("deve listar viagens", async () => {
        const fake_repo = {
            listar: vi.fn().mockResolvedValue([
                { via_id: 1, via_nome: "Viagem 1" },
                { via_id: 2, via_nome: "Viagem 2" },
            ]),
        };

        const service = criarService(fake_repo);

        const filtros = {
            usu_id: 1,
        };

        const res = await service.listar(filtros);

        expect(res).toHaveLength(2);
        expect(fake_repo.listar).toHaveBeenCalledWith(filtros);
    });

    it("deve listar viagens sem filtros", async () => {
        const fake_repo = {
            listar: vi.fn().mockResolvedValue([]),
        };

        const service = criarService(fake_repo);

        const res = await service.listar();

        expect(res).toEqual([]);
        expect(fake_repo.listar).toHaveBeenCalledWith({});
    });
});


describe("Criar viagem", () => {

    it("deve criar viagem quando estiver dentro do limite", async () => {
        const fake_repo = {
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(1),
            criarViagem: vi.fn().mockResolvedValue({
                via_id: 1,
                via_nome: "Nova viagem",
                via_status: STATUS_VIAGEM.ATIVA,
            }),
        };

        const service = criarService(fake_repo);

        const dados = {
            usu_id: 1,
            usu_plano: "free",
            via_nome: "Nova viagem",
        };

        const res = await service.criarViagem(dados);

        expect(res).toHaveProperty("via_id");

        expect(fake_repo.countViagensAtivasByUsuario)
            .toHaveBeenCalledWith(1);

        expect(fake_repo.criarViagem)
            .toHaveBeenCalledWith({
                ...dados,
                via_status: STATUS_VIAGEM.ATIVA,
            });
    });

    it("deve falhar quando atingir o limite de viagens", async () => {
        const fake_repo = {
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(999),
            criarViagem: vi.fn(),
        };

        const service = criarService(fake_repo);

        const dados = {
            usu_id: 1,
            usu_plano: "free",
            via_nome: "Nova viagem",
        };

        const res = await captureAppError(
            () => service.criarViagem(dados)
        );

        expect(res.status).toBe(409);
        expect(fake_repo.criarViagem).not.toHaveBeenCalled();
    });

    it("deve usar plano free quando o plano não existir", async () => {
        const fake_repo = {
            countViagensAtivasByUsuario: vi.fn().mockResolvedValue(0),
            criarViagem: vi.fn().mockResolvedValue({
                via_id: 1,
            }),
        };

        const service = criarService(fake_repo);

        const dados = {
            usu_id: 1,
            usu_plano: "plano_inexistente",
            via_nome: "Nova viagem",
        };

        await service.criarViagem(dados);

        expect(fake_repo.criarViagem).toHaveBeenCalledWith({
            ...dados,
            via_status: STATUS_VIAGEM.ATIVA,
        });
    });
});


describe("Editar viagem", () => {

    const body_cliente = {
        via_id: 1,
        usu_id: 1,
        via_nome: "Viagem editada",
        via_data_ini: "11-13-2113 13:13",
        via_data_fim: "12-31-2113 13:13",
    };

    it("deve editar viagem", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({
                via_id: 1,
                usu_id: 1
            }),
            editarViagem: vi.fn().mockResolvedValue({
                ...body_cliente
            }),
        };

        const service = criarService(fake_repo);

        const res = await captureAppError(
            async () => await service.editarViagem({
                ...body_cliente,
                usu_id: 1
            })
        );

        expect(res).toHaveProperty("via_id");

        expect(fake_repo.getById)
            .toHaveBeenCalledWith(body_cliente.via_id, 1);
    });

    it("deve validar editar viagem", async () => {
        const res = await captureAppError(
            () => dto.editarDto({
                campo_extra: "deve ser ignorado",
                ...body_cliente
            })
        );

        expect(res).toStrictEqual({
            ...body_cliente,
            via_data_ini: new Date(body_cliente.via_data_ini),
            via_data_fim: new Date(body_cliente.via_data_fim),
        });
    });

    it("deve falhar por viagem não encontrada (ou não pertencente ao usuário)", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            editarViagem: vi.fn(),
        };

        const service = criarService(fake_repo);

        const res = await captureAppError(
            async () => await service.editarViagem({
                ...body_cliente,
                usu_id: 1
            })
        );

        expect(res.status).toBe(404);

        expect(fake_repo.editarViagem)
            .not.toHaveBeenCalled();
    });

    it("deve falhar por data do fim anteceder a data de início", async () => {
        const res = await captureAppError(
            () => dto.editarDto({
                ...body_cliente,
                via_data_fim: "01-01-2000 00:00"
            })
        );

        expect(res[0].code).toBe("custom");
    });
});


describe("Deletar viagem", () => {

    it("deve deletar viagem", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue({
                via_id: 1,
                usu_id: 1
            }),
            deletarViagem: vi.fn().mockResolvedValue({
                via_id: 1
            }),
        };

        const service = criarService(fake_repo);

        const res = await captureAppError(
            async () => await service.deletarViagem({
                via_id: 1,
                usu_id: 1
            })
        );

        expect(res).toHaveProperty("via_id");

        expect(fake_repo.getById)
            .toHaveBeenCalledWith(1, 1);
    });

    it("deve falhar por viagem não encontrada (ou não pertencente ao usuário)", async () => {
        const fake_repo = {
            getById: vi.fn().mockResolvedValue(null),
            deletarViagem: vi.fn(),
        };

        const service = criarService(fake_repo);

        const res = await captureAppError(
            async () => await service.deletarViagem({
                via_id: 999,
                usu_id: 1
            })
        );

        expect(res.status).toBe(404);

        expect(fake_repo.deletarViagem)
            .not.toHaveBeenCalled();
    });
});
