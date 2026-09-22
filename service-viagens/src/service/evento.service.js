import AppError from "../infrastructure/errors/app.error.js";
import RESPONSE from "../shared/constants/response.js";
import { CATEGORIA_EVENTO, STATUS_EVENTO } from "../shared/constants/evento.constants.js";

function criarServiceEvento(repository, despesaClient) {
    async function listar(filtros = {}) {
        return await repository.listar(filtros);
    }

    async function getById(id) {
        return await repository.getById(id);
    }

    async function criarEvento(dados) {
        const viagem = await repository.getViagemById(dados.via_id);

        if (!viagem) {
            throw new AppError(RESPONSE.VIAGEM_NAO_ENCONTRADA);
        }

        const ultima_ordem = await repository.getUltimaOrdemByViagem(dados.via_id);

        const evento = await repository.criarEvento({
            ...dados,
            eve_status: STATUS_EVENTO.ATIVO,
            eve_ordem: ultima_ordem + 1,
        });

        if (evento.eve_orcamento > 0) {
            try {
                const despesa = await despesaClient.criarDespesa({
                    descricao: evento.eve_descricao,
                    categoria: CATEGORIA_EVENTO[evento.eve_categoria],
                    valor: evento.eve_orcamento,
                    eventoId: evento.eve_id,
                    viagemId: evento.via_id,
                });
            } catch (err) {
                await repository.marcarFalhaSincronizacaoDespesa(evento.eve_id);
            }
        }

        return evento;
    }

    async function editarEvento(dados) {
        const evento = await repository.getById(dados.eve_id, dados.usu_id);

        if (!evento) {
            throw new AppError(RESPONSE.EVENTO_NAO_ENCONTRADO);
        }

        return await repository.editarEvento(dados);
    }

    async function deletarEvento(dados) {
        const evento = await repository.getById(dados.eve_id, dados.usu_id);

        if (!evento) {
            throw new AppError(RESPONSE.EVENTO_NAO_ENCONTRADO);
        }

        return await repository.deletarEvento(dados);
    }

    return { listar, getById, criarEvento, editarEvento, deletarEvento }
}

export default criarServiceEvento;