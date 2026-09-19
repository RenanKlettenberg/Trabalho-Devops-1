/*
  Consumer da saga.

  Ele é para o RabbitMQ o que o controller é para o Express: recebe algo de
  fora, traduz para uma chamada do service e devolve uma resposta. Nenhuma
  regra de negócio mora aqui.

  Convenção de nomes de fila combinada com o grupo:
    - `cmd_*`      -> comando: o orquestrador manda alguém FAZER algo.
    - `resposta_*` -> a resposta desse comando, de volta para o orquestrador.
    - `service_quemEnvia/quemRecebe` -> evento avulso entre dois serviços.
*/

export const FILAS = Object.freeze({
    // Comandos que o orquestrador envia para o service-grupos
    CMD_VINCULAR: 'cmd_vincular_despesa_grupo',
    CMD_DESVINCULAR: 'cmd_desvincular_despesa_grupo',

    // Filas de resposta usadas quando a mensagem não traz um `replyTo`
    RESPOSTA_VINCULAR: 'resposta_vincular_despesa_grupo',
    RESPOSTA_DESVINCULAR: 'resposta_desvincular_despesa_grupo',

    // Eventos que outros serviços publicam para o grupos (padrão Event-Driven)
    EVENTOS_DESPESA: 'service_despesa/grupos',
    EVENTOS_VIAGEM: 'service_viagem/grupos',
    EVENTOS_USUARIO: 'service_usuario/grupos',
});

function criarConsumerSaga({ channel, sagaService }) {
    /*
      Envelope de resposta padronizado. O orquestrador só olha `sagaId` e
      `status` para decidir se segue em frente ou se compensa.
    */
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
      Trata um comando da saga.

      A decisão mais importante deste arquivo: quando a regra de negócio falha,
      nós respondemos FALHA e damos `ack` na mensagem. É tentador dar `nack`,
      mas aí o orquestrador nunca receberia resposta e a saga ficaria pendurada
      para sempre. `nack` fica reservado para mensagem corrompida, que ninguém
      consegue processar nem responder.
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

    /*
      Eventos avulsos (Event-Driven), sem resposta.

      Diferença para o comando: aqui ninguém está esperando retorno. O
      service-despesas avisa "cancelei a despesa X" e nós limpamos os vínculos
      por nossa conta, sem o orquestrador no meio.
    */
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

        await channel.consume(FILAS.CMD_VINCULAR, tratarVincular);
        await channel.consume(FILAS.CMD_DESVINCULAR, tratarDesvincular);
        await channel.consume(FILAS.EVENTOS_DESPESA, tratarEvento);
        await channel.consume(FILAS.EVENTOS_VIAGEM, tratarEvento);
        await channel.consume(FILAS.EVENTOS_USUARIO, tratarEvento);

        console.log('[service-grupos] Consumer da saga ativo.');
        return channel;
    }

    return { iniciar, tratarVincular, tratarDesvincular, tratarEvento };
}

export default criarConsumerSaga;
