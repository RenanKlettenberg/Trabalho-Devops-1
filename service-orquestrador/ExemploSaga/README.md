# Exemplo: como um novo serviço entra na saga

`service-orquestrador` hoje orquestra só o `service-despesas` (o único
participante de saga real que existe no repositório). Este diretório mostra
o contrato de mensagens usado e como estender a saga a outro serviço
(`service-grupos`, `service-usuario`, `service-viagens`) quando isso for
implementado — o arquivo `exemplo.consumer.js` aqui do lado **não é
importado por nada**, é só uma referência para copiar.

## Contrato de mensagens (RPC sobre RabbitMQ)

Cada passo da saga é um pedido/resposta clássico (RPC), não pub/sub:

- O orquestrador publica um **comando** numa fila `cmd_*`, com duas
  propriedades AMQP:
  - `correlationId`: o id da saga (usado para casar a resposta com quem
    está esperando).
  - `replyTo`: o nome da fila `resposta_*` onde a resposta deve ser
    publicada.
- O serviço participante consome a fila `cmd_*`, processa, e publica a
  resposta na fila indicada por `replyTo` (ou numa fila padrão, se
  `replyTo` não vier), preservando o mesmo `correlationId`.
- Corpo da resposta, sempre em JSON:
  ```json
  {
    "sagaId": "<correlationId recebido>",
    "status": "SUCESSO" | "FALHA",
    "evento": "ALGO_ACONTECEU",
    "...": "dados específicos do passo"
  }
  ```
- Erro técnico (banco fora do ar, payload inválido) → o consumer dá `nack`
  na mensagem e **não** publica resposta nenhuma. O orquestrador trata isso
  como timeout (5s por padrão) e marca a saga como `FALHA`.
- "Não encontrado"/regra de negócio violada → **não é** um nack; o consumer
  publica uma resposta explícita com `status: "FALHA"`, para o orquestrador
  não precisar esperar o timeout todo.

Esse é exatamente o contrato que `service-despesas` já implementa em
`src/infrastructure/adapters/in/messaging/consumers/DespesaConsumer.js`
(filas `cmd_registrar_despesa`/`resposta_registrar_despesa` e
`cmd_cancelar_despesa`/`resposta_cancelar_despesa`).

## Convenção de nomes para passos novos

Para um novo passo de validação, a convenção é `cmd_validar_<recurso>` /
`resposta_validar_<recurso>` — por exemplo:

- `cmd_validar_viagem` / `resposta_validar_viagem` (service-viagens)
- `cmd_validar_grupo` / `resposta_validar_grupo` (service-grupos)
- `cmd_validar_usuario` / `resposta_validar_usuario` (service-usuario)

## Passo a passo para adicionar um participante novo

Exemplo: fazer `service-viagens` validar a viagem antes de registrar a
despesa.

1. **No serviço participante** (`service-viagens`): criar um consumer nos
   moldes de `exemplo.consumer.js` — conecta no RabbitMQ, declara
   `cmd_validar_viagem`, consome, busca a viagem (dá pra reaproveitar o
   `viagem.repository.js`/`viagem.module.js` que já existe), e responde
   `SUCESSO`/`FALHA` na fila de `replyTo`. Ligar esse consumer no boot do
   serviço (`src/server.js`), do jeito que faltou ser feito em
   `service-despesas` (o `DespesaConsumer.js` de lá também só foi ligado
   agora, veja o histórico do `service-despesas/src/infrastructure/server.js`).

2. **No orquestrador**: abrir
   `src/application/sagas/RegistrarDespesaSaga.js` e acrescentar um item na
   lista devolvida por `passos()`, **antes** do passo
   `REGISTRAR_DESPESA`:
   ```js
   {
     nome: 'VALIDAR_VIAGEM',
     filaComando: 'cmd_validar_viagem',
     filaResposta: 'resposta_validar_viagem',
     montarPayload: (dados) => ({ viagemId: dados.viagemId }),
   },
   ```
   Nada mais precisa mudar: o `execute()` da saga já itera a lista, publica
   cada passo via `rpcClient.requisitar(...)`, registra o resultado em
   `saga.passos`, e aborta a saga (`FALHA`, sem seguir pros próximos
   passos) se qualquer passo não vier `SUCESSO`.

3. Repetir para `VALIDAR_GRUPO`/`VALIDAR_USUARIO` se/quando esses serviços
   também ganharem seus consumers.

Como os passos de validação são só leitura (nenhuma escrita em
grupos/usuario/viagens), não é necessário nenhum passo de compensação para
eles — só o registro da despesa em si precisa ser desfeito, e isso já é
coberto pela `CancelarDespesaSaga` existente.

## Segundo padrão: consulta direta entre serviços (sem orquestrador)

Nem toda comunicação entre serviços é um passo de saga. Exemplo real do
repositório: `service-grupos/src/service/divisao.service.js` calcula como
uma despesa se divide entre os participantes de um grupo, mas hoje **confia
no `valor` que o cliente HTTP manda no corpo da requisição** em vez de
perguntar pro `service-despesas` qual é o valor de verdade da despesa
(`des_id`) — ele nem tem como saber, já que não fala com despesas de jeito
nenhum hoje.

Isso não é uma transação que precisa de coordenação/compensação — é só uma
leitura. Não faz sentido passar pelo orquestrador pra isso; os dois
serviços conversam direto, usando o mesmo mecanismo RPC (`correlationId`/
`replyTo`) já usado nos passos de saga:

- `exemplo.despesa-consumer.js` — lado `service-despesas`: consome
  `cmd_obter_despesa`, reaproveita a `ObterDespesaQuery` que já existe, e
  responde em `resposta_obter_despesa`.
- `exemplo.grupo-rpc-client.js` — lado `service-grupos`: publica em
  `cmd_obter_despesa` e espera a resposta, no mesmo estilo de função-fábrica
  já usado no resto do serviço.

## Terceiro padrão: publicar um evento num canal (pub/sub, sem resposta)

Os dois padrões acima são RPC (pedido → resposta, sempre 1 pedinte e 1
respondente). Às vezes o objetivo é só **avisar que algo aconteceu**, sem
esperar resposta de ninguém, e sem saber (nem precisar saber) quem está
ouvindo — inclusive N serviços diferentes podem ouvir o mesmo aviso.

Exemplo: quando uma despesa é registrada, `service-despesas` poderia
publicar um evento `despesa.registrada` num exchange (`despesas_events`,
tipo `topic`); qualquer serviço interessado (notificações, auditoria,
invalidar um cache em grupos, etc.) cria sua própria fila, amarra nesse
exchange, e recebe o evento — sem que `service-despesas` precise saber que
esse serviço existe.

- `exemplo.publicar-evento.js` — lado publicador: usa o
  `RabbitMQPublisher.publicarEvento(exchange, routingKey, mensagem)` que já
  existe em `service-despesas` mas nunca é chamado.
- `exemplo.evento-consumer.js` — lado assinante: cada serviço cria sua
  própria fila e amarra (`bindQueue`) no exchange com a routing key que
  interessa (`despesa.*`, ou só `despesa.registrada`).

## Quarto padrão: publicar num canal e esperar respostas (scatter-gather)

Meio-termo entre RPC (exatamente 1 respondente) e pub/sub (0 respostas). Se
quem publica no canal precisa saber o que os assinantes acharam, mas não
sabe de antemão quantos são (0, 1 ou vários), não dá pra "esperar a
resposta" como no RPC comum — em vez disso, publica com `replyTo`/
`correlationId` (como no evento normal) e junta o que chegar numa fila
própria dentro de uma janela de tempo, seguindo em frente com o que tiver
quando a janela fechar.

- `exemplo.publicar-evento-com-resposta.js` — publica e coleta respostas
  por até `janelaMs`; quem quiser responder faz exatamente como um passo de
  saga (publica em `replyTo` com o mesmo `correlationId`), só que aqui pode
  ter mais de um assinante respondendo ao mesmo evento.

## Regra prática para decidir qual padrão usar

| | Passo de saga | Consulta direta | Evento (pub/sub) | Scatter-gather |
|---|---|---|---|---|
| Quem inicia | o orquestrador | o serviço que precisa do dado | o serviço onde o fato aconteceu | o serviço onde o fato aconteceu |
| Espera resposta? | sim | sim | não | sim, de 0..N |
| Quantos ouvintes | 1 (o participante do passo) | 1 (quem responde) | 0, 1 ou N | 0, 1 ou N |
| Como sabe que "acabou" | resposta chegou (ou timeout) | resposta chegou (ou timeout) | não se aplica | janela de tempo fixa (`janelaMs`) |
| Precisa de compensação se falhar? | sim (por isso existe orquestrador) | não, é só leitura | não se aplica | não se aplica |
| Fila/canal envolvido | orquestrador ↔ serviço, fila `cmd_/resposta_` | serviço ↔ serviço, fila `cmd_/resposta_` direta | exchange `topic`, 1 fila por assinante | exchange `topic` + fila de resposta temporária por pedido |
