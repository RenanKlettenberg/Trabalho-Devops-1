import criarServiceSaga from '../service/saga.service.js';
import criarConsumerSaga from '../consumer/saga.consumer.js';
import { conectarRabbitMQ } from '../infrastructure/messaging/rabbitmq.js';
import { repository as participanteRepository } from './participante.module.js';
import { repository as despesaParticipanteRepository } from './despesaParticipante.module.js';
import { service as grupoService } from './grupo.module.js';
import { service as divisaoService } from './divisao.module.js';

export const service = criarServiceSaga({
    grupoService,
    participanteRepository,
    despesaParticipanteRepository,
    divisaoService,
});


export async function iniciarSaga() {
    try {
        const channel = await conectarRabbitMQ();
        const consumer = criarConsumerSaga({ channel, sagaService: service });
        await consumer.iniciar();
        return consumer;
    } catch (erro) {
        console.error('[service-grupos] Saga desativada, não foi possível conectar no RabbitMQ:', erro.message);
        return null;
    }
}

export default service;
