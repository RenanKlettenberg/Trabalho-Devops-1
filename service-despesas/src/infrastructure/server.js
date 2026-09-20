import 'dotenv/config';
import app, { despesaRepository, criarDespesaCommand } from './app.js';
import RabbitMQPublisher from './adapters/out/messaging/publishers/RabbitMQPublisher.js';
import CompensarDespesasCommandHandler from './adapters/in/messaging/listeners/CompensarDespesasCommandHandler.js';
import iniciarConsumerDespesa from './adapters/in/messaging/consumers/DespesaConsumer.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

async function iniciarConsumerSaga() {
  const publisher = new RabbitMQPublisher();
  await publisher.conectar();

  const compensarDespesa = new CompensarDespesasCommandHandler(despesaRepository, publisher);

  await iniciarConsumerDespesa({
    registrarDespesa: criarDespesaCommand,
    compensarDespesa
  });
}

iniciarConsumerSaga().catch((erro) => {
  console.error('[service-despesas] Falha ao iniciar consumer da saga:', erro);
});
