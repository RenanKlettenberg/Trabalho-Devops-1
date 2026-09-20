/*
 * EXEMPLO — não é importado por nenhum código real.
 *
 * Mostra como um serviço participante (aqui, service-viagens) entraria na
 * saga respondendo a um comando de validação. Ver README.md ao lado para
 * o contrato completo e o passo a passo de integração no orquestrador.
 *
 * Para usar de verdade: copiar este arquivo para dentro do serviço (ex.
 * service-viagens/src/messaging/consumers/viagem.consumer.js), trocar o
 * "repository" fake abaixo pelo repository real do serviço (ex. o
 * `repository` exportado por `viagem.module.js`), e chamar
 * `iniciarConsumerValidarViagem(...)` no boot (`src/server.js`), do mesmo
 * jeito que foi feito para o DespesaConsumer em service-despesas.
 */

import amqp from 'amqplib';

const FILA_COMANDO = 'cmd_validar_viagem';
const FILA_RESPOSTA_PADRAO = 'resposta_validar_viagem';

export async function iniciarConsumerValidarViagem({
  repository, // ex: { getById(id) => Promise<{ rows }> }, mesmo shape do viagem.repository.js
  url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
}) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertQueue(FILA_COMANDO, { durable: true });

  channel.consume(FILA_COMANDO, async (msg) => {
    if (!msg) return;

    try {
      const { viagemId } = JSON.parse(msg.content.toString());
      const { rows } = await repository.getById(viagemId);
      const viagem = rows[0];

      const resposta = viagem
        ? {
            sagaId: msg.properties.correlationId,
            status: 'SUCESSO',
            evento: 'VIAGEM_VALIDADA',
            viagem: { id: viagem.via_id, grupoId: viagem.gru_id },
          }
        : {
            sagaId: msg.properties.correlationId,
            status: 'FALHA',
            evento: 'VIAGEM_NAO_ENCONTRADA',
          };

      const filaResposta = msg.properties.replyTo || FILA_RESPOSTA_PADRAO;
      await channel.assertQueue(filaResposta, { durable: true });
      channel.sendToQueue(filaResposta, Buffer.from(JSON.stringify(resposta)), { persistent: true });
      channel.ack(msg);
    } catch (error) {
      // Erro técnico (não "não encontrado") -> nack sem resposta;
      // o orquestrador trata isso como timeout.
      channel.nack(msg, false, false);
      console.error('[service-viagens] Falha ao validar viagem:', error);
    }
  });

  console.log('[service-viagens] Consumer conectado à fila da saga.');
  return { connection, channel };
}

export default iniciarConsumerValidarViagem;
