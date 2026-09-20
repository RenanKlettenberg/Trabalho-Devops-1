import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarConsumerSaga, { FILAS } from '../../consumer/saga.consumer.js';

/*
  Um canal falso do RabbitMQ. Com ele dá para testar todo o comportamento de
  mensageria (o que é respondido, para qual fila, quando dá ack ou nack) sem
  precisar de broker nenhum rodando.
*/
function criarChannelFake() {
    return {
        assertQueue: jest.fn().mockResolvedValue(undefined),
        sendToQueue: jest.fn(),
        consume: jest.fn().mockResolvedValue(undefined),
        ack: jest.fn(),
        nack: jest.fn(),
    };
}

// Monta uma mensagem no formato que o amqplib entrega ao consumer.
function criarMensagem(conteudo, properties = {}) {
    return {
        content: Buffer.from(typeof conteudo === 'string' ? conteudo : JSON.stringify(conteudo)),
        properties,
    };
}

// Lê o que foi publicado na chamada `indice` de sendToQueue.
function lerEnvio(channel, indice = 0) {
    const [fila, buffer, opcoes] = channel.sendToQueue.mock.calls[indice];
    return { fila, mensagem: JSON.parse(buffer.toString()), opcoes };
}

describe('saga.consumer', () => {
    let channel;
    let sagaService;
    let consumer;

    beforeEach(() => {
        channel = criarChannelFake();
        sagaService = {
            vincularDespesa: jest.fn(),
            desvincularDespesa: jest.fn(),
        };
        consumer = criarConsumerSaga({ channel, sagaService });
    });

    describe('iniciar', () => {
        it('declara todas as filas da saga antes de começar a consumir', async () => {
            await consumer.iniciar();

            const filasDeclaradas = channel.assertQueue.mock.calls.map(([fila]) => fila);
            expect(filasDeclaradas).toEqual(expect.arrayContaining(Object.values(FILAS)));
        });

        it('assina os comandos e os eventos', async () => {
            await consumer.iniciar();

            const filasConsumidas = channel.consume.mock.calls.map(([fila]) => fila);
            expect(filasConsumidas).toEqual([
                FILAS.CMD_VINCULAR,
                FILAS.CMD_DESVINCULAR,
                FILAS.EVENTOS_DESPESA,
                FILAS.EVENTOS_VIAGEM,
                FILAS.EVENTOS_USUARIO,
            ]);
        });
    });

    describe('tratarVincular', () => {
        it('chama o service com o payload e responde SUCESSO', async () => {
            const comando = { sagaId: 'saga-1', gru_id: 1, des_id: 42, valor: 300 };
            sagaService.vincularDespesa.mockResolvedValue({ divisao: [], vinculos: 2 });

            await consumer.tratarVincular(criarMensagem(comando));

            expect(sagaService.vincularDespesa).toHaveBeenCalledWith(comando);

            const { fila, mensagem, opcoes } = lerEnvio(channel);
            expect(fila).toBe(FILAS.RESPOSTA_VINCULAR);
            expect(mensagem).toMatchObject({
                sagaId: 'saga-1',
                servico: 'grupos',
                status: 'SUCESSO',
                evento: 'DESPESA_VINCULADA_AO_GRUPO',
                dados: { vinculos: 2 },
            });
            expect(opcoes.correlationId).toBe('saga-1');
            expect(channel.ack).toHaveBeenCalledTimes(1);
        });

        it('responde na fila do replyTo quando a mensagem traz uma', async () => {
            sagaService.vincularDespesa.mockResolvedValue({});

            await consumer.tratarVincular(
                criarMensagem({ sagaId: 'saga-1' }, { replyTo: 'fila_temporaria' })
            );

            expect(lerEnvio(channel).fila).toBe('fila_temporaria');
        });

        it('usa o correlationId como sagaId quando o payload não traz o campo', async () => {
            sagaService.vincularDespesa.mockResolvedValue({});

            await consumer.tratarVincular(criarMensagem({ gru_id: 1 }, { correlationId: 'saga-9' }));

            expect(lerEnvio(channel).mensagem.sagaId).toBe('saga-9');
        });

        /*
          O teste mais importante do arquivo: falha de negócio precisa virar uma
          resposta FALHA + ack. Se desse nack, o orquestrador ficaria esperando
          uma resposta que nunca chega e a saga travaria.
        */
        it('responde FALHA com o código do erro e dá ack quando a regra de negócio falha', async () => {
            sagaService.vincularDespesa.mockRejectedValue(
                Object.assign(new Error('Grupo não encontrado.'), { code: 'GRU03' })
            );

            await consumer.tratarVincular(criarMensagem({ sagaId: 'saga-1', gru_id: 999 }));

            expect(lerEnvio(channel).mensagem).toMatchObject({
                sagaId: 'saga-1',
                status: 'FALHA',
                evento: 'FALHA_DESPESA_VINCULADA_AO_GRUPO',
                erro: { code: 'GRU03', message: 'Grupo não encontrado.' },
            });
            expect(channel.ack).toHaveBeenCalledTimes(1);
            expect(channel.nack).not.toHaveBeenCalled();
        });

        it('descarta mensagem com JSON inválido sem responder nem reenfileirar', async () => {
            await consumer.tratarVincular(criarMensagem('isso não é json'));

            expect(channel.sendToQueue).not.toHaveBeenCalled();
            expect(channel.ack).not.toHaveBeenCalled();
            expect(channel.nack).toHaveBeenCalledWith(expect.anything(), false, false);
        });

        it('ignora entrega vazia (fila cancelada pelo broker)', async () => {
            await expect(consumer.tratarVincular(null)).resolves.toBeNull();
            expect(channel.ack).not.toHaveBeenCalled();
        });
    });

    describe('tratarDesvincular', () => {
        it('executa a compensação e responde na fila de resposta correspondente', async () => {
            sagaService.desvincularDespesa.mockResolvedValue({ des_id: 42, vinculosRemovidos: 2 });

            await consumer.tratarDesvincular(criarMensagem({ sagaId: 'saga-1', des_id: 42 }));

            expect(sagaService.desvincularDespesa).toHaveBeenCalledWith({ sagaId: 'saga-1', des_id: 42 });

            const { fila, mensagem } = lerEnvio(channel);
            expect(fila).toBe(FILAS.RESPOSTA_DESVINCULAR);
            expect(mensagem).toMatchObject({
                status: 'SUCESSO',
                evento: 'DESPESA_DESVINCULADA_DO_GRUPO',
                dados: { vinculosRemovidos: 2 },
            });
            expect(channel.ack).toHaveBeenCalledTimes(1);
        });
    });

    describe('tratarEvento', () => {
        it('limpa os vínculos ao receber DESPESA_CANCELADA', async () => {
            sagaService.desvincularDespesa.mockResolvedValue({ des_id: 42, vinculosRemovidos: 2 });

            await consumer.tratarEvento(criarMensagem({ evento: 'DESPESA_CANCELADA', des_id: 42 }));

            expect(sagaService.desvincularDespesa).toHaveBeenCalledWith({ des_id: 42 });
            expect(channel.ack).toHaveBeenCalledTimes(1);
        });

        it('ignora evento desconhecido, mas ainda assim dá ack para não travar a fila', async () => {
            await consumer.tratarEvento(criarMensagem({ evento: 'ALGO_QUE_NAO_NOS_INTERESSA' }));

            expect(sagaService.desvincularDespesa).not.toHaveBeenCalled();
            expect(channel.ack).toHaveBeenCalledTimes(1);
        });

        it('não responde nada: evento é via de mão única', async () => {
            sagaService.desvincularDespesa.mockResolvedValue({ des_id: 42, vinculosRemovidos: 2 });

            await consumer.tratarEvento(criarMensagem({ evento: 'DESPESA_CANCELADA', des_id: 42 }));

            expect(channel.sendToQueue).not.toHaveBeenCalled();
        });

        it('dá ack mesmo se o tratamento do evento explodir, para não reprocessar em loop', async () => {
            sagaService.desvincularDespesa.mockRejectedValue(new Error('banco fora do ar'));

            await consumer.tratarEvento(criarMensagem({ evento: 'DESPESA_CANCELADA', des_id: 42 }));

            expect(channel.ack).toHaveBeenCalledTimes(1);
        });
    });
});
