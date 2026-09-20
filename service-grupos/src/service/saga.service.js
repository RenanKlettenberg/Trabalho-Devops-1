import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';

/*
  Regra de negócio da participação do service-grupos na saga.

  Repare que este arquivo não importa nada de RabbitMQ: ele recebe um objeto
  simples e devolve um objeto simples. Quem traduz mensagem <-> chamada de
  função é o consumer (src/consumer/saga.consumer.js). Isso é o que mantém a
  arquitetura em camadas intacta e o que torna estes testes fáceis de escrever.
*/
function criarServiceSaga({
    grupoService,
    participanteRepository,
    despesaParticipanteRepository,
    divisaoService,
}) {
    /*
      Passo de VALIDAÇÃO da saga (padrão combinado com o orquestrador): roda
      ANTES da despesa ser criada, só leitura — confirma que o grupo existe e
      que tem pra quem ratear. Não grava nada, por isso não precisa de
      compensação: se um passo depois desse falhar, não há o que desfazer aqui.
    */
    async function validarGrupo({ gru_id }) {
        if (!Number.isFinite(Number(gru_id))) {
            throw new AppError({ ...RESPONSE.DADO_INVALIDO, message: 'gru_id é obrigatório.' });
        }

        // Lança GRUPO_NAO_ENCONTRADO se o grupo não existir.
        await grupoService.getById(gru_id);

        const doGrupo = (await participanteRepository.listarPorGrupo(gru_id)).rows;
        const elegiveis = doGrupo.filter((participante) => !participante.par_isento);

        if (elegiveis.length === 0) {
            throw new AppError(RESPONSE.GRUPO_SEM_PARTICIPANTES);
        }

        return { gru_id, participantes: elegiveis.length };
    }

    /*
      Passo de escrita: recebe o des_id já gerado pelo service-despesas e
      grava o rateio de verdade. Pronto e testado ponta a ponta; hoje não é
      chamado por nenhum passo da saga do orquestrador (que só usa
      validarGrupo, acima) — fica disponível para quando o disparo dessa
      escrita for definido (evento do despesas, ou chamada direta).
    */
    async function vincularDespesa({ gru_id, des_id, valor, participantes }) {
        validarComando({ gru_id, des_id, valor });

        // Lança GRUPO_NAO_ENCONTRADO se o grupo não existir.
        await grupoService.getById(gru_id);

        const doGrupo = (await participanteRepository.listarPorGrupo(gru_id)).rows;

        if (doGrupo.length === 0) {
            throw new AppError(RESPONSE.GRUPO_SEM_PARTICIPANTES);
        }

        const itens = participantes?.length
            ? montarItensInformados(participantes, doGrupo)
            : montarItensPadrao(doGrupo);

        if (itens.length === 0) {
            throw new AppError(RESPONSE.GRUPO_SEM_PARTICIPANTES);
        }

        await despesaParticipanteRepository.criarVinculosEmLote(des_id, itens);

        const divisao = await divisaoService.calcularDivisaoDespesa({ gru_id, des_id, valor });

        return { gru_id, des_id, valor, vinculos: itens.length, divisao };
    }

    /*
      Compensação: um passo posterior da saga falhou, então desfazemos o rateio.
      Não é erro desvincular uma despesa que não tinha vínculo nenhum — uma
      compensação precisa poder rodar mais de uma vez sem quebrar.
    */
    async function desvincularDespesa({ des_id }) {
        if (!Number.isFinite(Number(des_id))) {
            throw new AppError({ ...RESPONSE.DADO_INVALIDO, message: 'des_id é obrigatório.' });
        }

        const resultado = await despesaParticipanteRepository.deletarPorDespesa(des_id);

        return { des_id, vinculosRemovidos: resultado.rowCount ?? 0 };
    }

    function validarComando({ gru_id, des_id, valor }) {
        if (!Number.isFinite(Number(gru_id))) {
            throw new AppError({ ...RESPONSE.DADO_INVALIDO, message: 'gru_id é obrigatório.' });
        }

        if (!Number.isFinite(Number(des_id))) {
            throw new AppError({ ...RESPONSE.DADO_INVALIDO, message: 'des_id é obrigatório.' });
        }

        if (!Number.isFinite(Number(valor)) || Number(valor) <= 0) {
            throw new AppError({ ...RESPONSE.DADO_INVALIDO, message: 'valor deve ser maior que zero.' });
        }
    }

    // Ninguém foi informado: rateia entre todos os participantes não isentos.
    function montarItensPadrao(doGrupo) {
        return doGrupo
            .filter((participante) => !participante.par_isento)
            .map((participante) => ({
                par_id: participante.par_id,
                dp_exclusiva: false,
                dp_peso: 1,
            }));
    }

    // O orquestrador mandou a lista: só aceitamos quem realmente é do grupo.
    function montarItensInformados(participantes, doGrupo) {
        const idsDoGrupo = new Set(doGrupo.map((participante) => participante.par_id));

        return participantes.map((informado) => {
            const par_id = Number(informado.par_id);

            if (!idsDoGrupo.has(par_id)) {
                throw new AppError({
                    ...RESPONSE.PARTICIPANTE_FORA_DO_GRUPO,
                    payload: { par_id },
                });
            }

            return {
                par_id,
                dp_exclusiva: informado.dp_exclusiva ?? false,
                dp_peso: informado.dp_peso ?? 1,
            };
        });
    }

    return { validarGrupo, vincularDespesa, desvincularDespesa };
}

export default criarServiceSaga;
