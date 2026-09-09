import { sendToQueue } from './rabbitmq.js';

/*
  Exemplo de publicação para uma fila do serviço.
  Aqui a fila de destino pode ser qualquer uma das do fluxo.
*/
async function publicarExemplo() {
  const mensagem = {
    sagaId: 'saga-123',
    evento: 'GRUPO_SOLICITADO',
    data: new Date().toISOString()
  };

  await sendToQueue('service_grupos/viagem', mensagem);
  console.log('[service-grupos] Mensagem publicada em service_grupos/viagem');
}


