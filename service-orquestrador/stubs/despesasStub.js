const { connectRabbitMQ } = require('../rabbitmq');

/*
  ============================ TEMPORÁRIO ============================
  Dublê do service-despesas, só para conseguir demonstrar a saga de ponta a
  ponta enquanto o serviço real não está ligado no docker-compose e o consumer
  dele (iniciarConsumerDespesa) não é chamado por ninguém.

  Ligue com SIMULAR_DESPESAS=true. Quando o service-despesas real estiver no ar,
  desligue a variável e apague esta pasta — as filas e o formato das mensagens
  são exatamente os mesmos, então nada mais muda.
  ===================================================================
*/

const despesas = new Map();
let proximoId = 1000;

async function iniciarStubDespesas() {
    const channel = await connectRabbitMQ();

    await channel.assertQueue('cmd_registrar_despesa', { durable: true });
    await channel.assertQueue('cmd_cancelar_despesa', { durable: true });

    channel.consume('cmd_registrar_despesa', async (msg) => {
        if (!msg) return;

        const payload = JSON.parse(msg.content.toString());
        const sagaId = payload.sagaId ?? msg.properties.correlationId;

        /*
          ID inteiro de propósito: a tabela grupos.despesa_participante declara
          des_id como INT. O service-despesas real gera UUID — esse conflito de
          contrato precisa ser resolvido pelo grupo (veja o README da saga).
        */
        const despesaId = proximoId++;
        despesas.set(despesaId, { ...payload, status: 'ATIVA' });

        console.log(`[stub-despesas] Despesa ${despesaId} registrada (saga ${sagaId}).`);

        responder(channel, msg.properties.replyTo || 'resposta_registrar_despesa', {
            sagaId,
            servico: 'despesas',
            status: 'SUCESSO',
            evento: 'DESPESA_REGISTRADA',
            despesaId,
        }, sagaId);

        channel.ack(msg);
    });

    channel.consume('cmd_cancelar_despesa', async (msg) => {
        if (!msg) return;

        const payload = JSON.parse(msg.content.toString());
        const sagaId = payload.sagaId ?? msg.properties.correlationId;

        const despesa = despesas.get(payload.despesaId);
        if (despesa) despesa.status = 'ESTORNADA';

        console.log(`[stub-despesas] Despesa ${payload.despesaId} estornada (saga ${sagaId}).`);

        responder(channel, msg.properties.replyTo || 'resposta_cancelar_despesa', {
            sagaId,
            servico: 'despesas',
            status: 'SUCESSO',
            evento: 'DESPESAS_COMPENSADAS',
        }, sagaId);

        channel.ack(msg);
    });

    console.log('[stub-despesas] ATENÇÃO: dublê do service-despesas ativo (SIMULAR_DESPESAS=true).');
    return channel;
}

async function responder(channel, fila, mensagem, sagaId) {
    await channel.assertQueue(fila, { durable: true });

    channel.sendToQueue(fila, Buffer.from(JSON.stringify(mensagem)), {
        persistent: true,
        correlationId: sagaId,
    });
}

module.exports = { iniciarStubDespesas };
