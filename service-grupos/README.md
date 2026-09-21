# service-grupos

Gestão de grupos de viagem, participantes e divisão de custos. Participa da
saga de registro de despesas como **passo de validação**.

- Acesso: **http://localhost:8080** (pelo API Gateway) — base das rotas: `/api/v1`
- Porta interna: `3002`, alcançável só pelos outros containers. O serviço não
  tem porta publicada: quem fala com o mundo de fora é o gateway.
- Banco: `grupos_db`, schema `grupos`
- Broker: RabbitMQ (`rabbitmq:5672`)

Para subir o ambiente, testar no Postman e publicar mensagens nas filas à mão,
ver [COMO-RODAR.md](COMO-RODAR.md). A collection do Postman cobre a aplicação
inteira e fica em [postman/](../postman/), na raiz do projeto.

---

## O papel deste serviço na saga

O contrato de mensagens está em `service-orquestrador/ExemploSaga/README.md`.
Segundo ele, o service-grupos entra na saga como um passo de **validação,
somente leitura**:

| Ordem | Passo | Serviço | Escreve? |
| :--- | :--- | :--- | :--- |
| 1º | `VALIDAR_GRUPO` | **service-grupos** | não, só lê |
| 2º | `REGISTRAR_DESPESA` | service-despesas | sim |

O passo 1 só roda quando a despesa vem com `gruId` — despesa pessoal pula este
serviço.

Este serviço **não conversa diretamente com nenhum outro microsserviço**. Ele
fala só com o orquestrador, via filas. Não há cliente HTTP nas dependências, e
isso é proposital: no SAGA orquestrado, os participantes conhecem apenas o
coordenador.

### Por que não há compensação ativa

Uma compensação desfaz o que um passo escreveu. Como o único passo deste
serviço na saga **só lê**, não há o que desfazer:

- Passo 1 falha → nada foi escrito por ninguém.
- Passo 2 falha → o passo 1 apenas leu.

Nenhuma ordem de execução dessa saga deixa estado sujo. O README do contrato diz
o mesmo, com todas as letras: *"como os passos de validação são só leitura,
não é necessário nenhum passo de compensação para eles"*.

A compensação existe no projeto (`CancelarDespesaSaga` → `cmd_cancelar_despesa`),
mas atinge o service-despesas, não este serviço.

---

## Filas: ativo vs sobreaviso

**Nem toda fila deste serviço tem alguém do outro lado hoje.** Isso é
intencional. A tabela abaixo é a referência — a mesma está no topo de
[src/consumer/saga.consumer.js](src/consumer/saga.consumer.js).

| Fila | Status | Situação |
| :--- | :--- | :--- |
| `cmd_validar_grupo` | **ATIVO** | O orquestrador chama a cada `POST /api/sagas/despesas` com `gruId` |
| `cmd_vincular_despesa_grupo` | SOBREAVISO | Passo de escrita: grava o rateio. Implementado e testado, sem chamador |
| `cmd_desvincular_despesa_grupo` | SOBREAVISO | Compensação do passo acima. Idempotente de propósito |
| `service_despesa/grupos` | SOBREAVISO | Evento `DESPESA_CANCELADA`. O service-despesas não o publica hoje |

As filas `resposta_*` são declaradas mas nunca consumidas aqui — quem as lê é o
orquestrador.

### O que "SOBREAVISO" quer dizer

Código implementado, testado e funcionando, que **nenhum passo da saga atual
invoca**. Não é implementação pela metade: é a preparação para o dia em que a
saga ganhar um passo que escreve neste serviço. O momento em que a compensação
passa a ser obrigatória é quando a saga virar algo como:

```
1. VALIDAR_GRUPO           (lê)
2. REGISTRAR_DESPESA       (grava no despesas)
3. VINCULAR_DESPESA_GRUPO  (grava AQUI)      ← escrita neste serviço
4. NOTIFICAR_USUARIOS      (pode falhar)
```

Se o passo 4 falhasse, os vínculos gravados no passo 3 ficariam órfãos. É
exatamente para isso que o `desvincularDespesa` já existe.

Para ligar esse passo, basta acrescentar um item na lista de
`RegistrarDespesaSaga.passos()`, no orquestrador — **nada muda neste serviço**.

### Como exercitar as filas de sobreaviso

Como ninguém publica nelas, publique você, pelo painel do RabbitMQ em
http://localhost:15672 (`guest` / `guest`) → **Queues and Streams** → clique na
fila → **Publish message**.

Envio (`cmd_vincular_despesa_grupo`):

```json
{ "sagaId": "teste-1", "gru_id": 1, "des_id": "3ab18a06-d42b-4d10-ab18-1761105a51af", "valor": 300 }
```

Compensação (`cmd_desvincular_despesa_grupo`):

```json
{ "sagaId": "teste-1", "des_id": "3ab18a06-d42b-4d10-ab18-1761105a51af" }
```

Publique a compensação **duas vezes**: na segunda ela responde `SUCESSO` com
`vinculosRemovidos: 0` em vez de dar erro. Essa é a idempotência exigida pelo
padrão — o RabbitMQ pode entregar a mesma mensagem mais de uma vez, e uma
compensação que quebra ao repetir trava a saga.

> Atenção ao `snake_case`. Só o `validarGrupo` aceita `gruId` em camelCase (há
> uma tradução na borda do consumer, porque é o formato que o orquestrador usa).
> `vincularDespesa` e `desvincularDespesa` esperam `gru_id` e `des_id`.

---

## Arquitetura em camadas

```
routes/      → controller/  → service/     → repository/ → banco
consumer/    → service/                                     (mesma camada de regra)
```

Duas portas de entrada, uma só camada de regra de negócio:

- **HTTP**: `routes/` → `controller/` → `service/`
- **Filas**: `consumer/saga.consumer.js` → `service/saga.service.js`

O consumer é para o RabbitMQ o que o controller é para o Express: traduz o que
chegou de fora numa chamada de service e devolve resposta. **Nenhuma regra de
negócio mora nele.**

O `saga.service.js` não importa nada de RabbitMQ — recebe objeto simples,
devolve objeto simples. É isso que permite testá-lo sem broker nenhum.

### Arquivos de mensageria

| Arquivo | Papel |
| :--- | :--- |
| [src/infrastructure/messaging/rabbitmq.js](src/infrastructure/messaging/rabbitmq.js) | Abre a conexão. Único arquivo que sabe que o broker é RabbitMQ |
| [src/consumer/saga.consumer.js](src/consumer/saga.consumer.js) | Consome as filas **e** envia as respostas |
| [src/modules/saga.module.js](src/modules/saga.module.js) | Liga os dois e injeta as dependências |

Não existe arquivo separado de envio: este serviço nunca inicia uma conversa,
só responde. O envio acontece na função `responder()` dentro do consumer.

O `rabbitmq.js` tem um laço de 20 tentativas a cada 3s porque o broker demora a
aceitar conexões depois que o container sobe. Se as tentativas se esgotarem, a
saga fica desativada **mas a API REST continua no ar** — um microsserviço não
deve cair porque um vizinho caiu. Conserto: `docker compose restart service-grupos`.

---

## Regras de negócio

**Divisão de custos** (`divisao.service.js`), nesta ordem:

1. Se existe algum vínculo com `dp_exclusiva = true`, **só os exclusivos** dividem.
2. Senão, dividem todos os participantes **não isentos**.
3. O valor é rateado proporcionalmente ao `dp_peso` (padrão 1).

O cálculo não grava nada, é só leitura.

**Limite de participantes por plano** (`planos.js`): `free` = 5, `premium` = 15.
O plano vem do JWT.

**Permissão**: só o dono do grupo (`usu_id_dono`, extraído do token, nunca do
body) pode editar, deletar ou adicionar participantes.

---

## Testes

```bash
docker exec trabalho-devops-1-service-grupos-1 npm test
docker exec trabalho-devops-1-service-grupos-1 npm run test:coverage
```

- **Unitários** (`src/tests/unit/`) — usam um channel falso do RabbitMQ. Testam
  toda a mensageria (o que foi respondido, para qual fila, quando deu ack ou
  nack) **sem broker rodando**.
- **Integração** (`src/tests/integration/`) — usam `supertest` contra as rotas
  reais e **precisam de um Postgres com o `init.sql` já executado**. Escrevem no
  banco de desenvolvimento.

---

## O `des_id` é uma referência externa

A coluna `despesa_participante.des_id` é um **UUID**, não um número: é o
identificador que o `service-despesas` gera para a despesa dele
(`despesas.des_id UUID`). Este serviço guarda só o ponteiro; o dono do dado é o
outro serviço.

Não existe chave estrangeira nesse campo, e não pode existir: a tabela de
despesas vive em **outro banco**, de outro microsserviço. O Postgres não valida
referências entre bancos diferentes. Garantir que a despesa existe é
responsabilidade da aplicação — ver a limitação 1 abaixo.

O mesmo vale para `participantes.usu_id`, que aponta para o `service-usuario`.

---

## Limitações conhecidas

1. **O `des_id` não é validado e o `valor` vem do cliente.** Este serviço aceita
   qualquer UUID como `des_id`, mesmo de uma despesa que não existe, e usa o
   `valor` que veio no corpo da requisição em vez do valor real da despesa.
   Alguém poderia ratear uma despesa de R$1.000 informando R$10.

   **Conserto acordado:** consulta RPC direta grupos → despesas, pelas filas
   `cmd_obter_despesa` / `resposta_obter_despesa`, descrita como "segundo
   padrão" no `ExemploSaga/README.md` do orquestrador. Depende de um consumer
   novo no `service-despesas`, combinado com a equipe. Contrato pedido:

   ```
   pedido:    { "desId": "<uuid>" }
   sucesso:   { "sagaId", "status": "SUCESSO", "evento": "DESPESA_OBTIDA",
                "dados": { "desId", "valor", "moeda", "status" } }
   falha:     { "sagaId", "status": "FALHA", "evento": "FALHA_DESPESA_OBTIDA",
                "erro": { "code": "DES404", "message": "Despesa não encontrada." } }
   ```

   Do lado de cá falta o RPC client e fazer o `divisao.service.js` usar o valor
   que voltou. A migração de `des_id` para UUID, que era pré-requisito, já foi
   feita.

   > Atenção: o `ExemploSaga/README.md` cita dois arquivos de exemplo
   > (`exemplo.despesa-consumer.js` e `exemplo.grupo-rpc-client.js`) que **não
   > existem** no repositório. Não conte com eles.

2. **`DELETE /grupo/:id` com participantes retorna 500** com a mensagem crua do
   Postgres (`violates foreign key constraint`). Deveria ser um erro tratado,
   nos moldes do resto do `shared/constants/response.js`.

3. **O consumer não reconecta sozinho.** Se o RabbitMQ reiniciar com o serviço
   no ar, o canal é zerado mas nada chama `iniciarSaga()` de novo. Precisa de
   `docker compose restart service-grupos`.

4. **`db-grupos` não monta o `init.sql`** no `docker-compose.yml`, diferente dos
   bancos de despesas e do orquestrador. Depois de um `docker compose down -v`,
   as tabelas precisam ser criadas à mão (comando no [COMO-RODAR.md](COMO-RODAR.md)).
