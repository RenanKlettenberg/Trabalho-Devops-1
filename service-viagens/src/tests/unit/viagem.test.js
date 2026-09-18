import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/viagem.service.js";
import * as dto from "../../dto/viagem.dto.js";

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

        let res = await captureAppError(async () => await service.editarViagem({ ...body_cliente, usu_id: 1 }));

        expect(res).toHaveProperty("via_id");
        expect(fake_repo.getById).toHaveBeenCalledWith(body_cliente.via_id, 1);
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

        let res = await captureAppError(async () => await service.editarViagem({ ...body_cliente, usu_id: 1 }));

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