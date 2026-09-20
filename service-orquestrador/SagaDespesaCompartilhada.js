const crypto = require('crypto');
const { connectRabbitMQ } = require('./rabbitmq');

/*
  Saga "Despesa Compartilhada" — orquestração (Orchestration-based Saga).

  O orquestrador é o único que conhece o fluxo inteiro. Cada microsserviço só
  sabe executar o seu passo e responder SUCESSO ou FALHA; nenhum deles sabe que
  existe um passo seguinte. É isso que diferencia orquestração de coreografia.

  Fluxo feliz:
    1. cmd_registrar_despesa      -> service-despesas   (cria a despesa)
    2. cmd_vincular_despesa_grupo -> service-grupos     (rateia entre o grupo)
       => CONCLUIDA

  Se o passo 2 falhar, o passo 1 precisa ser desfeito. Como a despesa já foi
  gravada no banco do outro serviço, não existe "rollback": o que existe é uma
  transação compensatória, que é uma nova operação que anula a anterior.

    X. cmd_cancelar_despesa       -> service-despesas   (compensa o passo 1)
       => COMPENSADA
*/

const FILAS = Object.freeze({
    CMD_REGISTRAR_DESPESA: 'cmd_registrar_despesa',
    RESPOSTA_REGISTRAR_DESPESA: 'resposta_registrar_despesa',
    CMD_CANCELAR_DESPESA: 'cmd_cancelar_despesa',
    RESPOSTA_CANCELAR_DESPESA: 'resposta_cancelar_despesa',
    CMD_VINCULAR_GRUPO: 'cmd_vincular_despesa_grupo',
    RESPOSTA_VINCULAR_GRUPO: 'resposta_vincular_despesa_grupo',
    CMD_DESVINCULAR_GRUPO: 'cmd_desvincular_despesa_grupo',
    RESPOSTA_DESVINCULAR_GRUPO: 'resposta_desvincular_despesa_grupo',
});

const ETAPAS = Object.freeze({
    REGISTRANDO_DESPESA: 'REGISTRANDO_DESPESA',
    VINCULANDO_GRUPO: 'VINCULANDO_GRUPO',
    CONCLUIDA: 'CONCLUIDA',
    COMPENSANDO: 'COMPENSANDO',
    COMPENSADA: 'COMPENSADA',
    FALHOU: 'FALHOU',
});

// Tempo que esperamos por uma resposta antes de considerar o passo perdido.
const TIMEOUT_PADRAO_MS = Number(process.env.SAGA_TIMEOUT_MS || 15000);

function criarSaga({ sagaStateDb = {}, timeoutMs = TIMEOUT_PADRAO_MS } = {}) {
    let channel = null;
    const timers = new Map();

    async function publicar(fila, mensagem, sagaId) {
        await channel.assertQueue(fila, { durable: true });

        channel.sendToQueue(fila, Buffer.from(JSON.stringify(mensagem)), {
            persistent: true,
            correlationId: sagaId,
        });

        console.log(`[orquestrador] -> ${fila} (saga ${sagaId})`);
    }

    function registrarEtapa(sagaId, etapa, extras = {}) {
        const estado = sagaStateDb[sagaId];
        if (!estado) return null;

        estado.etapa = etapa;
        estado.atualizadoEm = new Date().toISOString();
        estado.historico.push({ etapa, em: estado.atualizadoEm, ...extras });
        Object.assign(estado, extras);

        return estado;
    }

    /*
      Um serviço fora do ar não responde nada — e sem isso a saga ficaria presa
      para sempre em "aguardando". O timeout trata silêncio como falha.
    */
    function agendarTimeout(sagaId, etapa) {
        cancelarTimeout(sagaId);

        const timer = setTimeout(() => {
            const estado = sagaStateDb[sagaId];
            if (!estado || estado.etapa !== etapa) return;

            console.error(`[orquestrador] Timeout na etapa ${etapa} (saga ${sagaId})`);
            tratarFalha(sagaId, { code: 'TIMEOUT', message: `Sem resposta na etapa ${etapa}.` });
        }, timeoutMs);

        timers.set(sagaId, timer);
    }

    function cancelarTimeout(sagaId) {
        const timer = timers.get(sagaId);
        if (timer) {
            clearTimeout(timer);
            timers.delete(sagaId);
        }
    }

    // Decide o que compensar com base em quanto da saga já tinha sido feito.
    async function tratarFalha(sagaId, erro) {
        cancelarTimeout(sagaId);

        const estado = sagaStateDb[sagaId];
        if (!estado) return null;

        estado.erro = erro;

        // A despesa nunca chegou a existir: não há nada a desfazer.
        if (!estado.despesaId) {
            return registrarEtapa(sagaId, ETAPAS.FALHOU, { erro });
        }

        registrarEtapa(sagaId, ETAPAS.COMPENSANDO, { erro });

        await publicar(
            FILAS.CMD_CANCELAR_DESPESA,
            { sagaId, despesaId: estado.despesaId, motivo: erro.message },
            sagaId
        );

        agendarTimeout(sagaId, ETAPAS.COMPENSANDO);
        return estado;
    }

    async function iniciar(dados) {
        const sagaId = crypto.randomUUID();

        sagaStateDb[sagaId] = {
            sagaId,
            etapa: ETAPAS.REGISTRANDO_DESPESA,
            entrada: dados,
            despesaId: null,
            divisao: null,
            erro: null,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            historico: [{ etapa: ETAPAS.REGISTRANDO_DESPESA, em: new Date().toISOString() }],
        };

        await publicar(
            FILAS.CMD_REGISTRAR_DESPESA,
            {
                sagaId,
                descricao: dados.descricao,
                valor: dados.valor,
                moeda: dados.moeda,
                categoria: dados.categoria,
                viagemId: dados.viagemId,
                eventoId: dados.eventoId ?? null,
            },
            sagaId
        );

        agendarTimeout(sagaId, ETAPAS.REGISTRANDO_DESPESA);

        return sagaStateDb[sagaId];
    }

    // Passo 1 respondeu: despesa criada -> manda o grupos ratear.
    async function aoResponderRegistroDespesa(resposta) {
        const sagaId = resposta.sagaId;
        const estado = sagaStateDb[sagaId];

        if (!estado || estado.etapa !== ETAPAS.REGISTRANDO_DESPESA) return null;

        cancelarTimeout(sagaId);

        if (resposta.status !== 'SUCESSO') {
            return tratarFalha(sagaId, resposta.erro ?? { code: '0', message: 'Falha ao registrar a despesa.' });
        }

        registrarEtapa(sagaId, ETAPAS.VINCULANDO_GRUPO, { despesaId: resposta.despesaId });

        await publicar(
            FILAS.CMD_VINCULAR_GRUPO,
            {
                sagaId,
                gru_id: estado.entrada.gru_id,
                des_id: resposta.despesaId,
                valor: estado.entrada.valor,
                participantes: estado.entrada.participantes,
            },
            sagaId
        );

        agendarTimeout(sagaId, ETAPAS.VINCULANDO_GRUPO);
        return sagaStateDb[sagaId];
    }

    // Passo 2 respondeu: ou fecha a saga, ou dispara a compensação.
    async function aoResponderVinculoGrupo(resposta) {
        const sagaId = resposta.sagaId;
        const estado = sagaStateDb[sagaId];

        if (!estado || estado.etapa !== ETAPAS.VINCULANDO_GRUPO) return null;

        cancelarTimeout(sagaId);

        if (resposta.status !== 'SUCESSO') {
            return tratarFalha(sagaId, resposta.erro ?? { code: '0', message: 'Falha ao vincular a despesa ao grupo.' });
        }

        return registrarEtapa(sagaId, ETAPAS.CONCLUIDA, { divisao: resposta.dados?.divisao ?? null });
    }

    async function aoResponderCancelamentoDespesa(resposta) {
        const sagaId = resposta.sagaId;
        const estado = sagaStateDb[sagaId];

        if (!estado || estado.etapa !== ETAPAS.COMPENSANDO) return null;

        cancelarTimeout(sagaId);

        return registrarEtapa(sagaId, ETAPAS.COMPENSADA);
    }

    function lerMensagem(msg) {
        const payload = JSON.parse(msg.content.toString());
        return { ...payload, sagaId: payload.sagaId ?? msg.properties.correlationId };
    }

    /*
      As respostas são só notificações para o orquestrador: qualquer erro aqui
      é problema nosso, não do remetente. Por isso damos ack sempre — devolver
      a mensagem para a fila só criaria um laço infinito.
    */
    function assinar(fila, handler) {
        return channel.consume(fila, async (msg) => {
            if (!msg) return;

            try {
                const resposta = lerMensagem(msg);
                console.log(`[orquestrador] <- ${fila} (saga ${resposta.sagaId}): ${resposta.status}`);
                await handler(resposta);
            } catch (erro) {
                console.error(`[orquestrador] Erro ao processar resposta de ${fila}:`, erro.message);
            }

            channel.ack(msg);
        });
    }

    async function iniciarConsumers() {
        channel = await connectRabbitMQ();

        for (const fila of Object.values(FILAS)) {
            await channel.assertQueue(fila, { durable: true });
        }

        await assinar(FILAS.RESPOSTA_REGISTRAR_DESPESA, aoResponderRegistroDespesa);
        await assinar(FILAS.RESPOSTA_VINCULAR_GRUPO, aoResponderVinculoGrupo);
        await assinar(FILAS.RESPOSTA_CANCELAR_DESPESA, aoResponderCancelamentoDespesa);

        console.log('[orquestrador] Saga de despesa compartilhada pronta.');
        return channel;
    }

    function consultar(sagaId) {
        return sagaStateDb[sagaId] ?? null;
    }

    function listar() {
        return Object.values(sagaStateDb);
    }

    return {
        iniciar,
        iniciarConsumers,
        consultar,
        listar,
        // expostos para os testes
        aoResponderRegistroDespesa,
        aoResponderVinculoGrupo,
        aoResponderCancelamentoDespesa,
    };
}

module.exports = { criarSaga, FILAS, ETAPAS };
