import 'dotenv/config';
import createApp from './app.js';
import RabbitMQRpcClient from './adapters/out/messaging/RabbitMQRpcClient.js';
import PostgresSagaRepository from './adapters/out/database/PostgresSagaRepository.js';

const PORT = process.env.PORT || 3004;

const rpcClient = new RabbitMQRpcClient();
const sagaRepository = new PostgresSagaRepository();

const app = createApp({ rpcClient, sagaRepository });

async function start() {
  await rpcClient.conectar();
  console.log('[service-orquestrador] Conectado ao RabbitMQ.');

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((erro) => {
  console.error('[service-orquestrador] Falha ao iniciar:', erro);
  process.exit(1);
});
