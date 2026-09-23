/*
  Consumer da saga.

  Ele é para o RabbitMQ o que o controller é para o Express: recebe algo de
  fora, traduz para uma chamada do service e devolve uma resposta. Nenhuma
  regra de negócio mora aqui.

  Convenção de nomes de fila:
    - `cmd_*`      -> comando: o orquestrador manda alguém FAZER algo.
    - `resposta_*` -> a resposta desse comando, de volta para o orquestrador.
    - `service_quemEnvia/quemRecebe` -> evento avulso entre dois serviços.
*/


/*
  Este serviço participa da RegistrarDespesaSaga em DOIS passos:

    1. VALIDAR_GRUPO            cmd_validar_grupo        (lê)
    2. REGISTRAR_DESPESA        -> service-despesas      (grava)
    3. VINCULAR_DESPESA_GRUPO   cmd_vincular_despesa_grupo (grava AQUI)

  Como o passo 3 escreve, a compensação é obrigatória: ao cancelar a despesa,
  a CancelarDespesaSaga publica cmd_desvincular_despesa_grupo para desfazer o
  rateio. Por isso desvincularDespesa é idempotente.
*/
export const FILAS = Object.freeze({
    // Passo 1 da saga: valida o grupo antes da despesa existir. Só leitura.
    CMD_VALIDAR: 'cmd_validar_grupo',
    RESPOSTA_VALIDAR: 'resposta_validar_grupo',

    // Passo 3 da saga: grava o rateio, com o des_id gerado no passo 2.
    CMD_VINCULAR: 'cmd_vincular_despesa_grupo',
    // Compensação do passo 3, publicada pela CancelarDespesaSaga.
    CMD_DESVINCULAR: 'cmd_desvincular_despesa_grupo',

    // Filas de resposta usadas quando a mensagem não traz um `replyTo`
    RESPOSTA_VINCULAR: 'resposta_vincular_despesa_grupo',
    RESPOSTA_DESVINCULAR: 'resposta_desvincular_despesa_grupo',

    // SOBREAVISO — evento que o service-despesas publicaria ao cancelar uma
    // despesa (Event-Driven, sem resposta). Hoje o cancelamento vem pela
    // saga, em cmd_desvincular_despesa_grupo, então ninguém publica aqui.
    EVENTOS_DESPESA: 'service_despesa/grupos',
});

function criarConsumerSaga({ channel, sagaService }) {

    function montarResposta({ sagaId, status, evento, dados, erro }) {
        return {
            sagaId,
            servico: 'grupos',
            status,
            evento,
            ...(dados ? { dados } : {}),
            ...(erro ? { erro } : {}),
            dataProcessamento: new Date().toISOString(),
        };
    }

    async function responder(fila, resposta, sagaId) {
        await channel.assertQueue(fila, { durable: true });

        channel.sendToQueue(fila, Buffer.from(JSON.stringify(resposta)), {
            persistent: true,
            correlationId: sagaId,
        });
    }

    /*
      quando a regra de negócio falha,
      nós respondemos FALHA e damos `ack` na mensagem, para a fila nao ficar pendurada
    */
    async function tratarComando(msg, { executar, evento, filaRespostaPadrao }) {
        if (!msg) return null;

        let payload;

        try {
            payload = JSON.parse(msg.content.toString());
        } catch (erro) {
            console.error('[service-grupos] Mensagem com JSON inválido, descartando:', erro.message);
            channel.nack(msg, false, false); // false = não devolve para a fila
            return null;
        }

        const sagaId = payload.sagaId ?? msg.properties?.correlationId ?? null;
        const filaResposta = msg.properties?.replyTo || filaRespostaPadrao;

        let resposta;

        try {
            const dados = await executar(payload);
            resposta = montarResposta({ sagaId, status: 'SUCESSO', evento, dados });
            console.log(`[service-grupos] ${evento} (saga ${sagaId})`);
        } catch (erro) {
            resposta = montarResposta({
                sagaId,
                status: 'FALHA',
                evento: `FALHA_${evento}`,
                erro: { code: erro.code ?? '0', message: erro.message },
            });
            console.error(`[service-grupos] FALHA_${evento} (saga ${sagaId}): ${erro.message}`);
        }

        await responder(filaResposta, resposta, sagaId);
        channel.ack(msg);

        return resposta;
    }


    function tratarValidarGrupo(msg) {
        return tratarComando(msg, {
            executar: (payload) => sagaService.validarGrupo({ gru_id: payload.gruId ?? payload.gru_id }),
            evento: 'GRUPO_VALIDADO',
            filaRespostaPadrao: FILAS.RESPOSTA_VALIDAR,
        });
    }

    function tratarVincular(msg) {
        return tratarComando(msg, {
            executar: (payload) => sagaService.vincularDespesa(payload),
            evento: 'DESPESA_VINCULADA_AO_GRUPO',
            filaRespostaPadrao: FILAS.RESPOSTA_VINCULAR,
        });
    }

    function tratarDesvincular(msg) {
        return tratarComando(msg, {
            executar: (payload) => sagaService.desvincularDespesa(payload),
            evento: 'DESPESA_DESVINCULADA_DO_GRUPO',
            filaRespostaPadrao: FILAS.RESPOSTA_DESVINCULAR,
        });
    }

    async function tratarEvento(msg) {
        if (!msg) return null;

        let payload;

        try {
            payload = JSON.parse(msg.content.toString());
        } catch (erro) {
            console.error('[service-grupos] Evento com JSON inválido, descartando:', erro.message);
            channel.nack(msg, false, false);
            return null;
        }

        try {
            if (payload.evento === 'DESPESA_CANCELADA' && payload.des_id) {
                const resultado = await sagaService.desvincularDespesa({ des_id: payload.des_id });
                console.log(
                    `[service-grupos] Despesa ${payload.des_id} cancelada: ${resultado.vinculosRemovidos} vínculo(s) removido(s).`
                );
            } else {
                console.log('[service-grupos] Evento recebido e ignorado:', payload.evento);
            }
        } catch (erro) {
            console.error('[service-grupos] Erro ao tratar evento:', erro.message);
        }

        channel.ack(msg);
        return payload;
    }

    async function iniciar() {
        const filas = Object.values(FILAS);

        for (const fila of filas) {
            await channel.assertQueue(fila, { durable: true });
        }

        await channel.consume(FILAS.CMD_VALIDAR, tratarValidarGrupo);
        await channel.consume(FILAS.CMD_VINCULAR, tratarVincular);
        await channel.consume(FILAS.CMD_DESVINCULAR, tratarDesvincular);
        await channel.consume(FILAS.EVENTOS_DESPESA, tratarEvento);

        console.log('[service-grupos] Consumer da saga ativo.');
        return channel;
    }

    return { iniciar, tratarValidarGrupo, tratarVincular, tratarDesvincular, tratarEvento };
}

export default criarConsumerSaga;
