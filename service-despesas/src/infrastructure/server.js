import 'dotenv/config';
import amqp from 'amqplib';

import createApp from './app.js';
import database from './config/database.js';

import PostgresDespesaRepository from './adapters/out/database/PostgresDespesaRepository.js';
import RedisCacheAdapter from './adapters/out/cache/RedisCacheAdapter.js';
import ExchangeRateApiAdapter from './adapters/out/external/ExchangeRateApiAdapter.js';

import RegistrarDespesaCommand from '../application/use-cases/commands/RegistrarDespesa/RegistrarDespesaCommand.js';
import CompensarDespesaCommand from '../application/use-cases/commands/CompensarDespesa/CompensarDespesaCommand.js';

import DespesaConsumer from './adapters/in/messaging/consumers/DespesaConsumer.js';
import CompensarDespesasCommandHandler from './adapters/in/messaging/consumers/CompensarDespesasCommandHandler.js';

const PORT = process.env.PORT || 3003;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

async function start() {
  const despesaRepository = new PostgresDespesaRepository(database);
  const cacheProvider = new RedisCacheAdapter();
  const exchangeRateProvider = new ExchangeRateApiAdapter(cacheProvider);

  const app = createApp({ despesaRepository, exchangeRateProvider });

  const conexaoRabbit = await amqp.connect(RABBITMQ_URL);
  const canalRabbit = await conexaoRabbit.createChannel();
  console.log('[service-despesas] Conectado ao RabbitMQ.');

  const registrarDespesaCommand = new RegistrarDespesaCommand(despesaRepository);
  const compensarDespesaCommand = new CompensarDespesaCommand(despesaRepository);

  await new DespesaConsumer(canalRabbit, registrarDespesaCommand).iniciar();
  await new CompensarDespesasCommandHandler(canalRabbit, compensarDespesaCommand).iniciar();

  app.listen(PORT, () => {
    console.log(`🚀 service-despesas rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((erro) => {
  console.error('[service-despesas] Falha ao iniciar:', erro);
  process.exit(1);
});
