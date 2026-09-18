import { describe, it, expect } from 'vitest';
import api from "../../shared/utils/api.request.js";

let criadoViaId;
const USU_ID_TESTE = 1;

describe("Criar viagem", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = {
            usu_id: USU_ID_TESTE,
            via_nome: "Viagem de Teste",
            via_data_ini: "2026-10-01 10:00",
            via_data_fim: "2026-10-10 18:00",
        };

        const res = await api.post('3001', 'viagem', data);

        expect(res.status).toBe(200);
        expect(res.body.payload).toHaveProperty('via_id');
        
        // Guarda o ID gerado para ser reutilizado nos schemas do PUT e DELETE
        criadoViaId = res.body.payload.via_id;
    });

    it("deve retornar 400 - DADO INVÁLIDO (falta usu_id e via_nome)", async () => {
        const res = await api.post('3001', 'viagem', {});

        expect(res.status).toBe(400);
    });

    it("deve retornar 400 - DADO INVÁLIDO (apenas uma data enviada)", async () => {
        const data = {
            usu_id: USU_ID_TESTE,
            via_nome: "Viagem sem data fim",
            via_data_ini: "2026-10-01 10:00",
        };

        const res = await api.post('3001', 'viagem', data);

        expect(res.status).toBe(400);
    });
});

describe("Editar viagem", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = {
            via_id: criadoViaId,
            usu_id: USU_ID_TESTE,
            via_nome: "Viagem Editada",
            via_data_ini: "2026-10-01 10:00",
            via_data_fim: "2026-10-12 18:00",
        };

        const res = await api.put('3001', `viagem/${criadoViaId}`, data);

        expect(res.status).toBe(200);
    });

    it("deve retornar 400 - DADO INVÁLIDO (falta via_id e usu_id)", async () => {
        const res = await api.put('3001', `viagem/${criadoViaId}`, {});

        expect(res.status).toBe(400);
    });

    it("deve retornar 404 - NÃO ENCONTRADO", async () => {
        const data = {
            via_id: 999999,
            usu_id: USU_ID_TESTE,
            via_nome: "Viagem inexistente",
        };

        const res = await api.put('3001', 'viagem/999999', data);

        expect(res.status).toBe(404);
    });
});

describe("Deletar viagem", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = {
            via_id: criadoViaId,
            usu_id: USU_ID_TESTE,
        };

        const res = await api.delete('3001', `viagem/${criadoViaId}`, data);

        expect(res.status).toBe(200);
    });

    it("deve retornar 400 - DADO INVÁLIDO (falta payload obrigatório)", async () => {
        const res = await api.delete('3001', `viagem/${criadoViaId}`);

        expect(res.status).toBe(400);
    });
});