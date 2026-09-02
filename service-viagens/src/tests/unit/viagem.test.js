import { describe, it, expect, vi } from 'vitest';
import captureAppError from "../../shared/utils/test.throw.js";
import criarService from "../../service/viagem.service.js";
import * as dto from "../../dto/viagem.dto.js";


describe("Criar viagem", () => {
    const valid_data = {
        via_nome: "Viagem de teste",
        via_data_ini: "11-13-2113 13:13",
        via_data_fim: "12-31-2113 13:13",

        usu_id: 1, //ID do usuário de teste
        crn_id: 1,
        gru_id: 1,
    }

    it("deve criar viagem", async () => {
        const fake_repo = {
            criarViagem: vi.fn().mockResolvedValue({ ...valid_data }),
            getViagemByPeriodo: vi.fn().mockResolvedValue({ ...valid_data }),
        };
        const service = criarService(fake_repo);

        let res = await captureAppError(async () => await service.criarUsuario({ ...valid_data }));

        expect(res).toHaveProperty("jwt");
    })

    it("deve validar criar viagem", async () => {
        let res = await captureAppError(() => dto.criarDto({ campo_extra: "deve ser ignorado", ...valid_data }));

        expect(res).toStrictEqual(valid_data);
    })

    it("deve falhar por exceder limite de viagens ativas", async () => {
        let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_email: "invalido" }));

        expect(res[0].format).toBe('email');
    })

    describe("Deve falhar por data inválida", () => {
        it("falha por viagem já marcada no período marcado", async () => {
            const fake_repo = {
                criarUsuario: vi.fn().mockResolvedValue({ ...valid_data }),
                getByEmail: vi.fn().mockResolvedValue({ rowCount: 1 })
            };
            const service = criarService(fake_repo);

            let res = await captureAppError(async () => await service.criarUsuario({ ...valid_data }));

            expect(res.status).toBe(409);
        })

        it("falha por data do evento inválida", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: "testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" }));

            expect(res[0].code).toBe('too_big');
        })

        it("falha por data do começo da viagem já passou", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: "testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" }));

            expect(res[0].code).toBe('too_big');
        })
        
        it("falha por data do fim do evento anteceder a data inicial", async () => {
            let res = await captureAppError(() => dto.criarDto({ ...valid_data, usu_nome: "testeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" }));

            expect(res[0].code).toBe('too_big');
        })
    })
})