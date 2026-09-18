import AppError from "../infrastructure/errors/app.error.js";
import RESPONSE from "../shared/constants/response.js";
import STATUS_VIAGEM from "../shared/constants/viagem.constants.js";
import LIMITE_VIAGENS_ATIVAS from "../shared/constants/plano.constants.js";

function criarServiceViagem(repository) {
    async function listar(filtros = {}) {
        return await repository.listar(filtros);
    }

    async function getById(id) {
        return await repository.getById(id);
    }

    async function criarViagem(dados) {
        const qtd_ativas = await repository.countViagensAtivasByUsuario(dados.usu_id);
        const limite = LIMITE_VIAGENS_ATIVAS[dados.usu_plano] ?? LIMITE_VIAGENS_ATIVAS.free;

        if (qtd_ativas >= limite) {
            throw new AppError(RESPONSE.VIAGENS_LIMITE_EXCEDIDO);
        }

        return await repository.criarViagem({
            ...dados,
            via_status: STATUS_VIAGEM.ATIVA,
        });
    }

    async function editarViagem(dados) {
        const viagem = await repository.getById(dados.via_id, dados.usu_id);

        if (!viagem) {
            throw new AppError(RESPONSE.VIAGEM_NAO_ENCONTRADA);
        }

        return await repository.editarViagem(dados);
    }

    async function deletarViagem(dados) {
        const viagem = await repository.getById(dados.via_id, dados.usu_id);

        if (!viagem) {
            throw new AppError(RESPONSE.VIAGEM_NAO_ENCONTRADA);
        }

        return await repository.deletarViagem(dados);
    }

    return { listar, getById, criarViagem, editarViagem, deletarViagem }
}

export default criarServiceViagem;