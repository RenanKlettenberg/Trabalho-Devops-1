import { describe, it, expect } from 'vitest';
import api from "../../shared/utils/api.request.js"

describe("Criar evento", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = {
            eve_nome: "Check-in hotel",
            eve_categoria: 2, // Hospedagem
            eve_data_estimatida: false,
            eve_data_ini: "2113-11-13 14:00",
            eve_data_fim: "2113-11-13 15:00",
            via_id: 100,
            usu_id: 1,
        }

        const res = await api.post('3001', 'evento/', data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.post('3001', 'evento/', {});

        expect(res.status).toBe(400)
    })

    it("deve retornar 404 - VIAGEM NÃO ENCONTRADA", async () => {
        const data = {
            eve_nome: "Evento órfão",
            eve_categoria: 1,
            eve_data_estimatida: true,
            via_id: 999999,
            usu_id: 1,
        }

        const res = await api.post('3001', 'evento/', data);

        expect(res.status).toBe(404)
    })
})

describe("Editar evento", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const data = {
            usu_id: 1,
            eve_nome: "Check-in hotel (remarcado)",
        }

        const res = await api.put('3001', 'evento/1', data);

        expect(res.status).toBe(200)
    })

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.put('3001', 'evento/abc', {}); // id inválido

        expect(res.status).toBe(400)
    })

    it("deve retornar 404 - NÃO ENCONTRADO", async () => {
        const data = { usu_id: 1, eve_nome: "Evento inexistente" }

        const res = await api.put('3001', 'evento/999999', data);

        expect(res.status).toBe(404)
    })
})

describe("Deletar evento", () => {
    it("deve retornar 200 - SUCESSO", async () => {
        const res = await api.delete('3001', 'evento/1', { usu_id: 1 });

        expect(res.status).toBe(200)
    })

    it("deve retornar 400 - DADO INVÁLIDO", async () => {
        const res = await api.delete('3001', 'evento/abc'); // id inválido

        expect(res.status).toBe(400)
    })

    it("deve retornar 404 - NÃO ENCONTRADO", async () => {
        const res = await api.delete('3001', 'evento/999999', { usu_id: 1 });

        expect(res.status).toBe(404)
    })
})