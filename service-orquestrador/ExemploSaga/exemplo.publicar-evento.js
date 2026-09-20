/*
 * EXEMPLO — não é importado por nenhum código real.
 *
 * Terceiro padrão: publicar um EVENTO num canal (exchange topic) pra quem
 * quiser ouvir, sem esperar resposta nenhuma — diferente dos outros dois
 * exemplos (que são RPC: pedido -> resposta, sempre 1 pedinte e 1
 * respondente). Aqui é fire-and-forget: N serviços podem escutar o mesmo
 * evento, e quem publica nem sabe quem (ou se alguém) está ouvindo.
 *
 * Use isso quando o interesse é "avisar que algo aconteceu" (ex: uma
 * despesa foi registrada) e não "preciso de uma resposta específica de um
 * serviço específico" — pra isso último, ver exemplo.grupo-rpc-client.js.
 *
 * service-despesas já tem a classe pronta pra isso:
 * src/infrastructure/adapters/out/messaging/publishers/RabbitMQPublisher.js
 * (método `publicarEvento(exchange, routingKey, mensagem)`), só não é
 * chamada em nenhum lugar ainda. Este exemplo mostra exatamente como
 * chamá-la — o import abaixo assume que este arquivo foi copiado pra
 * dentro de service-despesas/src/application/... (ajuste o caminho
 * relativo conforme onde você colar o arquivo de verdade).
 */

import RabbitMQPublisher from '../infrastructure/adapters/out/messaging/publishers/RabbitMQPublisher.js';

const EXCHANGE = 'despesas_events'; // exchange do tipo 'topic'

export async function publicarDespesaRegistrada(despesa) {
  const publisher = new RabbitMQPublisher();
  await publisher.conectar();

  // routing key hierárquica (despesa.<evento>) pra quem quiser escutar só
  // um subconjunto, ex: bind em 'despesa.*' ou só 'despesa.registrada'
  await publisher.publicarEvento(EXCHANGE, 'despesa.registrada', {
    evento: 'DESPESA_REGISTRADA',
    despesaId: despesa.id,
    viagemId: despesa.viagemId,
    valor: despesa.valor,
    moeda: despesa.moedaOriginal,
    eventoId: despesa.eventoId,
    ocorreuEm: new Date().toISOString(),
  });

  await publisher.desconectar();
}

/*
 * Onde chamar de verdade: dentro de RegistrarDespesaCommand.execute(), logo
 * depois de `await this.repository.salvar(despesa)` — ou no
 * DespesaConsumer, depois de registrar a despesa vinda da saga. O ponto é
 * publicar o evento sempre que uma despesa nascer, independente de quem
 * mandou registrar (REST ou saga).
 */
export default publicarDespesaRegistrada;
