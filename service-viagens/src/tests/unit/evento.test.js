import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/evento.service.js";
import * as dto from "../../dto/evento.dto.js";

describe("Criar evento", () => {
    const valid_data = {
        eve_nome: "Check-in hotel",
        eve_categoria: 2, // Hospedagem
        eve_data_estimatida: false,
        eve_data_ini: "11-13-2113 14:00",
        eve_data_fim: "11-13-2113 15:00",
        via_id: 1,
        usu_id: 1,
    }

    it("deve criar evento com a próxima ordem disponível", async () => {
        const fake_repo = {
            getViagemById: vi.fn().mockResolvedValue({ via_id: 1 }),
            getUltimaOrdemByViagem: vi.fn().mockResolvedValue(3),
            criarEvento: vi.fn().mockResolvedValue({ ...valid_data, eve_id: 1, eve_ordem: 4 }),
        };
        const fake_despesa_client = { criarDespesa: vi.fn() };
        const service = criarService(fake_repo, fake_despesa_client);

        let res = await captureAppError(async () => await service.criarEvento({ ...valid_data }));

        expect(res.eve_ordem).toBe(4);
    })

    it("deve validar criar evento", async () => {
        let res = await captureAppError(() => dto.criarDto({ campo_extra: "deve ser ignorado", ...valid_data }));

        expect(res).toMatchObject({
            eve_nome: valid_data.eve_nome,
            eve_categoria: valid_data.eve_categoria,
            eve_data_estimatida: valid_data.eve_data_estimatida,
            eve_data_ini: new Date(valid_data.eve_data_ini),
            eve_data_fim: new Date(valid_data.eve_data_fim),
            eve_status: 1,       // default aplicado pelo schema
            eve_orcamento: 0,    // default aplicado pelo schema
            via_id: valid_data.via_id,
            usu_id: valid_data.usu_id,
        });
        expect(res).not.toHaveProperty("campo_extra");
    })

    it("deve falhar por viagem não encontrada", async () => {
        const fake_repo = {
            getViagemById: vi.fn().mockResolvedValue(null),
            criarEvento: vi.fn(),
        };
        const service = criarService(fake_repo, { criarDespesa: vi.fn() });

        let res = await captureAppError(async () => await service.criarEvento({ ...valid_data }));

        expect(res.status).toBe(404);
    })

    it("deve falhar por categoria inexistente", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, eve_categoria: 99 }));

        expect(res[0].code).toBe('custom');
    })

    it("deve falhar por horário fixo sem data de início/fim", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, eve_data_estimatida: false, eve_data_ini: undefined, eve_data_fim: undefined }));

        expect(res[0].code).toBe('custom');
    })

    it("deve permitir duração estimada sem data fixa", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, eve_data_estimatida: true, eve_data_ini: undefined, eve_data_fim: undefined }));

        expect(res.eve_data_estimatida).toBe(true);
    })
})

describe("Criar evento - integração com ms-despesas (Requisito 3)", () => {
    const valid_data = {
        eve_nome: "Passeio de barco",
        eve_categoria: 3, // Lazer
        eve_data_estimatida: true,
        eve_orcamento: 250.00,
        via_id: 1,
        usu_id: 1,
    }

    it("deve disparar criação de despesa quando eve_orcamento > 0", async () => {
        const fake_repo = {
            getViagemById: vi.fn().mockResolvedValue({ via_id: 1 }),
            getUltimaOrdemByViagem: vi.fn().mockResolvedValue(0),
            criarEvento: vi.fn().mockResolvedValue({ ...valid_data, eve_id: 5 }),
        };
        const fake_despesa_client = {
            criarDespesa: vi.fn().mockResolvedValue({ des_id: 42 }),
        };
        const service = criarService(fake_repo, fake_despesa_client);

        await captureAppError(async () => await service.criarEvento({ ...valid_data }));

        expect(fake_despesa_client.criarDespesa).toHaveBeenCalledOnce();
    })

    it("não deve disparar criação de despesa quando eve_orcamento é 0", async () => {
        const fake_repo = {
            getViagemById: vi.fn().mockResolvedValue({ via_id: 1 }),
            getUltimaOrdemByViagem: vi.fn().mockResolvedValue(0),
            criarEvento: vi.fn().mockResolvedValue({ ...valid_data, eve_orcamento: 0, eve_id: 6 }),
        };
        const fake_despesa_client = { criarDespesa: vi.fn() };
        const service = criarService(fake_repo, fake_despesa_client);

        await captureAppError(async () => await service.criarEvento({ ...valid_data, eve_orcamento: 0 }));

        expect(fake_despesa_client.criarDespesa).not.toHaveBeenCalled();
    })

    it("deve salvar erro de sincronização se a chamada ao ms-despesas falhar, sem quebrar a criação do evento", async () => {
        const fake_repo = {
            getViagemById: vi.fn().mockResolvedValue({ via_id: 1 }),
            getUltimaOrdemByViagem: vi.fn().mockResolvedValue(0),
            criarEvento: vi.fn().mockResolvedValue({ ...valid_data, eve_id: 7 }),
            marcarFalhaSincronizacaoDespesa: vi.fn(),
        };
        const fake_despesa_client = {
            criarDespesa: vi.fn().mockRejectedValue(new Error("ms-despesas indisponível")),
        };
        const service = criarService(fake_repo, fake_despesa_client);

        let res = await captureAppError(async () => await service.criarEvento({ ...valid_data }));

        expect(res).toHaveProperty("eve_id");
        expect(fake_repo.marcarFalhaSincronizacaoDespesa).toHaveBeenCalledOnce();
    })
})