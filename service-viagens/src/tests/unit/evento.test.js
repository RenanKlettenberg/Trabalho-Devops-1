import { describe, it, expect, vi } from "vitest";
import criarServiceEvento from "../../service/evento.service.js";
import RESPONSE from "../../shared/constants/response.js";

describe("Evento Service", () => {

    function criarMocks() {
        return {
            repository: {
                listar: vi.fn(),
                getById: vi.fn(),
                getViagemById: vi.fn(),
                getUltimaOrdemByViagem: vi.fn(),
                criarEvento: vi.fn(),
                editarEvento: vi.fn(),
                deletarEvento: vi.fn(),
                marcarFalhaSincronizacaoDespesa: vi.fn(),
            },

            despesaClient: {
                criarDespesa: vi.fn(),
            }
        };
    }

    describe("listar", () => {

        it("deve listar eventos", async () => {
            const { repository, despesaClient } = criarMocks();

            const eventos = [
                { eve_id: 1, eve_nome: "Check-in" },
                { eve_id: 2, eve_nome: "Almoço" }
            ];

            repository.listar.mockResolvedValue(eventos);

            const service = criarServiceEvento(repository, despesaClient);

            const resultado = await service.listar({
                via_id: 1
            });

            expect(repository.listar).toHaveBeenCalledWith({
                via_id: 1
            });

            expect(resultado).toEqual(eventos);
        });

    });

    describe("getById", () => {

        it("deve buscar evento pelo ID", async () => {
            const { repository, despesaClient } = criarMocks();

            const evento = {
                eve_id: 10,
                eve_nome: "Check-in"
            };

            repository.getById.mockResolvedValue(evento);

            const service = criarServiceEvento(repository, despesaClient);

            const resultado = await service.getById(10);

            expect(repository.getById).toHaveBeenCalledWith(10);
            expect(resultado).toEqual(evento);
        });

    });

    describe("criarEvento", () => {

        it("deve criar evento com status ativo e próxima ordem", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getViagemById.mockResolvedValue({
                via_id: 1
            });

            repository.getUltimaOrdemByViagem.mockResolvedValue(5);

            repository.criarEvento.mockResolvedValue({
                eve_id: 20,
                eve_nome: "Check-in",
                eve_categoria: 2,
                eve_orcamento: 0,
                via_id: 1
            });

            const service = criarServiceEvento(repository, despesaClient);

            const dados = {
                eve_nome: "Check-in",
                eve_categoria: 2,
                eve_orcamento: 0,
                via_id: 1
            };

            const resultado = await service.criarEvento(dados);

            expect(repository.criarEvento).toHaveBeenCalledWith({
                ...dados,
                eve_status: 1,
                eve_ordem: 6,
            });

            expect(resultado.eve_id).toBe(20);
            expect(despesaClient.criarDespesa).not.toHaveBeenCalled();
        });

        it("deve criar despesa quando evento possui orçamento", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getViagemById.mockResolvedValue({
                via_id: 1
            });

            repository.getUltimaOrdemByViagem.mockResolvedValue(2);

            repository.criarEvento.mockResolvedValue({
                eve_id: 30,
                eve_descricao: "Hotel",
                eve_categoria: 2,
                eve_orcamento: 500,
                via_id: 1
            });

            despesaClient.criarDespesa.mockResolvedValue({
                sucesso: true
            });

            const service = criarServiceEvento(repository, despesaClient);

            const resultado = await service.criarEvento({
                via_id: 1,
                eve_categoria: 2,
                eve_orcamento: 500
            });

            expect(despesaClient.criarDespesa).toHaveBeenCalledWith({
                descricao: "Hotel",
                categoria: "HOSPEDAGEM",
                valor: 500,
                eventoId: 30,
                viagemId: 1,
            });

            expect(resultado.eve_id).toBe(30);
        });

        it("deve marcar falha quando criação da despesa falhar", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getViagemById.mockResolvedValue({
                via_id: 1
            });

            repository.getUltimaOrdemByViagem.mockResolvedValue(2);

            repository.criarEvento.mockResolvedValue({
                eve_id: 31,
                eve_descricao: "Hotel",
                eve_categoria: 2,
                eve_orcamento: 500,
                via_id: 1
            });

            despesaClient.criarDespesa.mockRejectedValue(
                new Error("Erro no serviço de despesas")
            );

            const service = criarServiceEvento(repository, despesaClient);

            await service.criarEvento({
                via_id: 1,
                eve_categoria: 2,
                eve_orcamento: 500
            });

            expect(
                repository.marcarFalhaSincronizacaoDespesa
            ).toHaveBeenCalledWith(31);
        });

        it("deve lançar erro quando viagem não existir", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getViagemById.mockResolvedValue(null);

            const service = criarServiceEvento(repository, despesaClient);

            await expect(
                service.criarEvento({
                    via_id: 999999,
                    eve_nome: "Evento"
                })
            ).rejects.toMatchObject({
                message: RESPONSE.VIAGEM_NAO_ENCONTRADA.message
            });

            expect(repository.criarEvento).not.toHaveBeenCalled();
        });

    });

    describe("editarEvento", () => {

        it("deve editar evento existente", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getById.mockResolvedValue({
                eve_id: 10
            });

            repository.editarEvento.mockResolvedValue({
                eve_id: 10,
                eve_nome: "Evento editado"
            });

            const service = criarServiceEvento(repository, despesaClient);

            const dados = {
                eve_id: 10,
                usu_id: 1,
                eve_nome: "Evento editado"
            };

            const resultado = await service.editarEvento(dados);

            expect(repository.getById).toHaveBeenCalledWith(10, 1);
            expect(repository.editarEvento).toHaveBeenCalledWith(dados);
            expect(resultado.eve_nome).toBe("Evento editado");
        });

        it("deve lançar erro quando evento não existir", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getById.mockResolvedValue(null);

            const service = criarServiceEvento(repository, despesaClient);

            await expect(
                service.editarEvento({
                    eve_id: 999999,
                    usu_id: 1
                })
            ).rejects.toMatchObject({
                message: RESPONSE.EVENTO_NAO_ENCONTRADO.message
            });

            expect(repository.editarEvento).not.toHaveBeenCalled();
        });

    });

    describe("deletarEvento", () => {

        it("deve deletar evento existente", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getById.mockResolvedValue({
                eve_id: 10
            });

            repository.deletarEvento.mockResolvedValue({
                sucesso: true
            });

            const service = criarServiceEvento(repository, despesaClient);

            const dados = {
                eve_id: 10,
                usu_id: 1
            };

            const resultado = await service.deletarEvento(dados);

            expect(repository.getById).toHaveBeenCalledWith(10, 1);
            expect(repository.deletarEvento).toHaveBeenCalledWith(dados);
            expect(resultado).toEqual({
                sucesso: true
            });
        });

        it("deve lançar erro quando evento não existir", async () => {
            const { repository, despesaClient } = criarMocks();

            repository.getById.mockResolvedValue(null);

            const service = criarServiceEvento(repository, despesaClient);

            await expect(
                service.deletarEvento({
                    eve_id: 999999,
                    usu_id: 1
                })
            ).rejects.toMatchObject({
                message: RESPONSE.EVENTO_NAO_ENCONTRADO.message
            });

            expect(repository.deletarEvento).not.toHaveBeenCalled();
        });

    });

});