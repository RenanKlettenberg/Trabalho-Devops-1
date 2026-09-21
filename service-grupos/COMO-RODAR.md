# Como rodar e testar o service-grupos

Passo a passo completo, do zero até a saga rodando. Todos os comandos aqui foram
executados de verdade neste projeto.

Para entender **o que** o serviço faz e seu papel na saga, ver o
[README do serviço](../README.md).

**Os comandos assumem o `cmd.exe` do Windows, rodando na raiz do projeto**
(`Trabalho-Devops-1`, a pasta que tem o `docker-compose.yml`) — não dentro de
`service-grupos`. Onde o PowerShell difere, está anotado.

---

## Resumo rápido

Para quem já fez isso antes e só quer os comandos:

```cmd
docker compose up --build -d
docker compose ps
docker compose logs service-grupos
```

Se for a primeira vez, ou depois de um `down -v`, criar as tabelas:

```cmd
docker exec -i trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db < service-grupos\init.sql
docker exec -i trabalho-devops-1-db-usuario-1 psql -U usuario -d banco < service-usuario\init.sql
```

---

## Antes de começar

### Docker Desktop precisa estar aberto

No Windows, o `docker` do terminal é só um cliente — ele conversa com um serviço
que roda dentro do **Docker Desktop**. Com o aplicativo fechado, todo comando
falha com "cannot connect to the Docker daemon".

Teste: `docker ps`. Se listar uma tabela (mesmo vazia), está tudo certo.

### Os secrets e os `.env`

Estes arquivos **não vão para o Git** (estão no `.gitignore`), então não vêm
quando alguém clona o repositório. Precisam ser criados uma vez:

```cmd
echo|set /p="devops123" > secrets\db_password.txt
echo|set /p="uma_string_secreta_qualquer" > secrets\secret_jwt.txt
echo|set /p="outra_string_qualquer" > secrets\pepper.txt
```

E o `.env` de cada serviço, copiado do `.env.example` ao lado:

```cmd
copy service-grupos\.env.example service-grupos\.env
copy service-usuario\.env.example service-usuario\.env
copy service-despesas\.env.example service-despesas\.env
copy service-orquestrador\.env.example service-orquestrador\.env
```

> O `service-viagens/.env.example` aponta para o banco errado (`db-usuario` e
> porta 3000, quando o compose expõe 3001 e existe um `db-viagens`). Para esse,
> crie o `.env` com `DB_HOST=db-viagens`, `DB_NAME=viagens_db` e
> `PORT_BACK=3001`.

---

## Passo 1 — Derrubar o que estiver no ar

```cmd
docker compose down -v
```

- `docker compose` — lê o `docker-compose.yml` da pasta atual. Por isso o
  diretório importa.
- `down` — para e remove os containers e a rede criada pelo compose.
- `-v` — remove também os **volumes**, onde o Postgres guarda os dados.
  **Isso apaga os bancos.**

Use o `-v` quando quiser começar limpo. No dia a dia, `docker compose down`
sozinho preserva seus dados de teste.

**Conferir:** `docker compose ps` deve devolver uma tabela vazia.

---

## Passo 2 — Subir a aplicação

```cmd
docker compose up --build -d
```

- `up` — cria e inicia todos os serviços do `docker-compose.yml`. São 13: cinco
  microsserviços, cinco bancos Postgres, RabbitMQ, Redis e pgAdmin.
- `--build` — reconstrói as imagens a partir dos `Dockerfile`. Necessário na
  primeira vez e quando mudar `package.json` ou `Dockerfile`. **Mudança em
  arquivo `.js` não precisa** (ver "Editar código" no fim).
- `-d` — *detached*: roda em segundo plano e devolve o terminal. Sem o `-d`, o
  log dos 13 containers toma a tela e `Ctrl+C` derruba tudo.

A primeira vez demora alguns minutos: baixa as imagens e roda `npm install` em
cada microsserviço.

---

## Passo 3 — Conferir se subiu de verdade

### 3.1 Os containers

```cmd
docker compose ps
```

13 containers `Up`, e o `rabbitmq-devops` com `Up (healthy)`.

> ⚠️ **`Up` não quer dizer "funcionando".** Ver a seção de erros — o container
> pode estar de pé com a aplicação morta por dentro.

### 3.2 O log do service-grupos

```cmd
docker compose logs service-grupos
```

Procure as três linhas:

```
Servidor iniciado na porta 3002
[rabbitmq] Conectado.
[service-grupos] Consumer da saga ativo.
```

Ver algumas linhas `Tentativa N/20 falhou` **antes** do `Conectado.` é normal —
é o laço de retentativa esperando o RabbitMQ ficar pronto.

### 3.3 O log do orquestrador

```cmd
docker compose logs --tail 5 service-orquestrador
```

Esperado: `Conectado ao RabbitMQ.` e `Servidor rodando na porta 3004`. Se
aparecer `app crashed`, ver a seção de erros.

### 3.4 A API responde

```cmd
curl http://localhost:3002/api/v1/health
```

Esperado: `{"status":"ok","service":"service-grupos"}`

---

## Passo 4 — Criar as tabelas

Necessário na primeira vez e **sempre depois de um `docker compose down -v`**.

O `docker-compose.yml` monta o `init.sql` automaticamente só para dois bancos
(`db-despesas` e `db-orquestrador`). O `db-grupos` e o `db-usuario` não têm essa
linha, então sobem vazios.

```cmd
docker exec -i trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db < service-grupos\init.sql
docker exec -i trabalho-devops-1-db-usuario-1 psql -U usuario -d banco < service-usuario\init.sql
```

- `docker exec` — executa um comando **dentro** de um container que já roda.
- `-i` — mantém a entrada aberta, o que permite ao `<` empurrar o arquivo para
  dentro do container.
- `psql -U usuario -d grupos_db` — cliente do Postgres, como usuário `usuario`.

O segundo comando é o banco de usuários, necessário porque o login (que gera o
token JWT) mora no `service-usuario`.

Esperado: `CREATE SCHEMA` seguido de três `CREATE TABLE`.

> **No PowerShell o `<` não funciona.** Lá seria:
> `Get-Content service-grupos\init.sql | docker exec -i trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db`

**Conferir:**

```cmd
docker exec trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db -c "\dt grupos.*"
```

Esperado: `grupos`, `participantes` e `despesa_participante`.

---

## Passo 5 — Criar usuário e pegar o token

Todas as rotas do service-grupos exigem um JWT válido. O login fica no
`service-usuario`, na porta 3000.

Pelo **Postman** (recomendado): importe
`service-grupos.postman_collection.json`, rode **0. Setup → Criar usuário** e
depois **0. Setup → Login**. O token é salvo sozinho na variável `{{token}}` e
todas as outras requisições já vão autenticadas.

Pelo terminal:

```cmd
curl -X POST http://localhost:3000/api/v1/usuario -H "Content-Type: application/json" -d "{\"usu_nome\":\"Julia\",\"usu_email\":\"julia@teste.com\",\"usu_password\":\"Senha@123\",\"usu_plano\":\"free\"}"
```

```cmd
curl -X POST http://localhost:3000/api/v1/session -H "Content-Type: application/json" -d "{\"usu_email\":\"julia@teste.com\",\"usu_password\":\"Senha@123\"}"
```

A senha precisa ter 8+ caracteres, uma letra, um número e um caractere especial.
O campo `jwt` da resposta é o token. Ele dura 24h.

---

## Passo 6 — Criar grupo e participantes

No Postman, nesta ordem:

1. **1. Grupos → Criar grupo** — o `gru_id` é salvo sozinho.
2. **2. Participantes → Criar participante** — rode **duas ou três vezes**,
   trocando o nome no body.

O segundo ponto importa: o `validarGrupo` exige pelo menos um participante **não
isento**. Com o grupo vazio, tudo falha com `GRU04`.

---

## Passo 7 — Calcular a divisão

**4. Divisão → Calcular divisão** — a rota principal do serviço.

As regras, nesta ordem:

1. Se existe vínculo com `dp_exclusiva = true`, só os exclusivos dividem.
2. Senão, dividem todos os participantes não isentos.
3. O valor é rateado proporcionalmente ao `dp_peso` (padrão 1).

Exemplo verificado: R$300 entre Julia (peso 1) e Renan (peso 2) → 100 e 200, com
o participante isento fora da conta.

---

## Passo 8 — Testar a saga

Pasta **5. SAGA** do Postman, ou direto:

```cmd
curl -X POST http://localhost:3004/api/sagas/despesas -H "Content-Type: application/json" -d "{\"descricao\":\"Hotel\",\"valor\":300,\"moeda\":\"BRL\",\"categoria\":\"hospedagem\",\"viagemId\":1,\"gruId\":1}"
```

O que acontece:

```
POST :3004/api/sagas/despesas
   → orquestrador publica em  cmd_validar_grupo
      → o consumer do service-grupos acorda, chama validarGrupo()
      → responde em  resposta_validar_grupo  {status: SUCESSO}
   → orquestrador segue para REGISTRAR_DESPESA
   → 201 CONCLUIDA
```

No log: `[service-grupos] GRUPO_VALIDADO (saga <uuid>)`

**Caminho de falha** — troque `gruId` por `99999`. Volta `422` com `status:
FALHA` e o erro `GRU03`, e a despesa nunca é criada. Esse é o ponto do padrão
SAGA.

Deixe o log aberto num terminal separado para acompanhar:

```cmd
docker compose logs -f service-grupos
```

O `-f` é *follow*. `Ctrl+C` encerra só o acompanhamento, não o container.

---

## Passo 9 — Exercitar envio e compensação

As filas `cmd_vincular_despesa_grupo` e `cmd_desvincular_despesa_grupo` estão em
**sobreaviso**: implementadas e testadas, mas nenhum passo da saga atual as
chama (ver o [README do serviço](../README.md)). Para exercitá-las, publique na
fila à mão.

Painel do RabbitMQ: http://localhost:15672 (`guest` / `guest`) → aba **Queues
and Streams** → clique na fila → seção **Publish message** → cole no **Payload**
→ botão **Publish message**.

**Envio** (`cmd_vincular_despesa_grupo`):

```json
{ "sagaId": "teste-1", "gru_id": 1, "des_id": "3ab18a06-d42b-4d10-ab18-1761105a51af", "valor": 300 }
```

O `des_id` é um **UUID**, não um número — é o id que o service-despesas gera.
Mandar um inteiro aqui é rejeitado.

Confira que gravou:

```cmd
docker exec trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db -c "SELECT * FROM grupos.despesa_participante;"
```

**Compensação** (`cmd_desvincular_despesa_grupo`):

```json
{ "sagaId": "teste-1", "des_id": "3ab18a06-d42b-4d10-ab18-1761105a51af" }
```

Rode o `SELECT` de novo — as linhas sumiram.

**Publique a compensação uma segunda vez.** Ela responde `SUCESSO` com
`vinculosRemovidos: 0` em vez de dar erro. Essa é a idempotência exigida pelo
padrão: o RabbitMQ pode entregar a mesma mensagem duas vezes, e uma compensação
que quebra ao repetir trava a saga.

Para ler a resposta: vá na fila `resposta_vincular_despesa_grupo`, seção **Get
messages**, mude **Ack Mode** para `Automatic ack` e clique em **Get Message(s)**.

> ⚠️ Atenção ao `snake_case`. Só o `validarGrupo` aceita `gruId` em camelCase
> (há uma tradução na borda do consumer). `vincularDespesa` e
> `desvincularDespesa` esperam `gru_id` e `des_id`.

---

## Rodar a suíte de testes

```cmd
docker exec trabalho-devops-1-service-grupos-1 npm test
docker exec trabalho-devops-1-service-grupos-1 npm run test:coverage
```

São **71 testes** em 9 arquivos:

- **Unitários** (`src/tests/unit/`) — usam um channel falso do RabbitMQ. Testam
  toda a mensageria sem broker rodando.
- **Integração** (`src/tests/integration/`) — usam `supertest` contra as rotas
  reais e **precisam de um Postgres com o `init.sql` executado**. Escrevem no
  banco de desenvolvimento.

---

## Portas

| O quê | Onde |
| :--- | :--- |
| service-grupos | http://localhost:3002/api/v1 |
| service-usuario (login) | http://localhost:3000/api/v1 |
| service-viagens | http://localhost:3001 |
| service-despesas | http://localhost:3003 |
| service-orquestrador (saga) | http://localhost:3004/api |
| Painel do RabbitMQ | http://localhost:15672 (guest / guest) |
| pgAdmin | http://localhost:5050 (admin@admin.com / 123456) |
| Postgres do grupos | localhost:5434 |

---

## Quando algo dá errado

Erros que realmente aconteceram neste projeto, com o conserto de cada um.

### `Up` não quer dizer "funcionando"

O `docker compose ps` mostrar `Up` significa só que o **container** está de pé —
não que a aplicação dentro dele está viva. Como os serviços rodam com `nodemon`,
quando o Node crasha o nodemon continua rodando à espera de mudança em arquivo,
e o container segue `Up` com a aplicação morta.

**Por isso, sempre confira o log, não só o `ps`.**

---

### O `service-orquestrador` fica `Up` mas não responde

**Sintoma:** chamadas para `localhost:3004` não respondem. No log:

```
[service-orquestrador] Falha ao iniciar: Error: connect ECONNREFUSED ...:5672
[nodemon] app crashed - waiting for file changes before starting...
```

**Causa:** ele tenta conectar no RabbitMQ **uma vez só** e morre se não
conseguir. Diferente do `service-grupos`, não tem laço de retentativa.

**Conserto:**

```cmd
docker compose restart service-orquestrador
```

Confirme com `docker compose logs --tail 5 service-orquestrador` — deve aparecer
`Conectado ao RabbitMQ.` e `Servidor rodando na porta 3004`.

---

### A saga demora ~5 segundos e volta `FALHA`, mesmo com o grupo correto

**Sintoma:** o `POST /api/sagas/despesas` leva 5,1s e responde `422` com
`status: FALHA`. No log do **service-grupos** aparece `GRUPO_VALIDADO` normal —
ou seja, o seu passo funcionou.

**Causa:** 5 segundos é o timeout do RPC client do orquestrador. Se o seu passo
respondeu, quem não respondeu foi o **passo seguinte**: o `service-despesas` não
está conectado ao RabbitMQ. Ele também não tem laço de retentativa, e o servidor
HTTP dele continua de pé mesmo sem o broker — então o container parece saudável.

**Como confirmar:**

```cmd
docker compose logs --tail 10 service-despesas
```

Procure por `Falha ao iniciar consumer da saga: Error: connect ECONNREFUSED`.
O certo é `[service-despesas] Consumer conectado às filas da saga.`

**Conserto:**

```cmd
docker compose restart service-despesas
```

Depois disso a saga volta a responder em ~0,15s com `CONCLUIDA`.

> Três dos serviços dependem do RabbitMQ e só o `service-grupos` tem laço de
> retentativa. Depois de um `docker compose up` do zero, vale conferir os três
> logs — ou simplesmente reiniciar `service-despesas` e `service-orquestrador`.

---

### `[service-grupos] Saga desativada, não foi possível conectar no RabbitMQ`

**Sintoma:** a API na porta 3002 funciona, mas nada acontece quando o
orquestrador publica nas filas.

**Causa:** o serviço subiu junto com o broker e esgotou as 20 tentativas (60s)
do laço de retentativa do `rabbitmq.js` antes do RabbitMQ ficar pronto.

**Conserto:**

```cmd
docker compose restart service-grupos
```

Deve aparecer `[rabbitmq] Conectado.` e `[service-grupos] Consumer da saga ativo.`

> Ver linhas `Tentativa N/20 falhou` **seguidas de** `Conectado.` é normal — é o
> laço fazendo o trabalho dele.

---

### O RabbitMQ sai com erro na primeiríssima subida

**Sintoma:** o `up` termina com
`dependency failed to start: container rabbitmq-devops exited (1)`. No log:

```
Error when reading /var/lib/rabbitmq/.erlang.cookie: eacces
```

**Causa:** falha transitória de inicialização do broker.

**Conserto:** suba de novo, sem `--build`:

```cmd
docker compose up -d
```

---

### `relation "grupos.grupos" does not exist`

**Sintoma:** a API responde 500 em qualquer rota que toca o banco.

**Causa:** o `db-grupos` não monta o `init.sql` no `docker-compose.yml`. Depois
de um `docker compose down -v`, o banco sobe vazio.

**Conserto:** o Passo 4.

---

### Erro de `secret` ou `.env` não encontrado

**Sintoma:** o `up` falha reclamando de arquivo faltando.

**Causa:** `secrets/*.txt` e os `.env` não vão para o Git.

**Conserto:** ver "Antes de começar", no topo deste arquivo.

---

### 401 no Postman em requisições que funcionavam

**Sintoma:** `{"code":"SES02"}` ou `{"code":"SES03"}`.

**Causa:** o token JWT expira em 24h.

**Conserto:** rode de novo **0. Setup → Login**.

---

### `DELETE /grupo/:id` retorna 500

**Sintoma:** `violates foreign key constraint "fk_participantes_gru_id"`.

**Causa:** não é erro de uso — o grupo ainda tem participantes e o serviço não
trata esse caso. Limitação conhecida (ver o README do serviço).

**Conserto:** delete os participantes primeiro.

---

### `port is already allocated`

**Sintoma:** o `up` falha dizendo que a porta já está em uso.

**Causa:** outro programa ocupa a porta — um Postgres local na 5432, ou uma
subida anterior não derrubada.

**Conserto:** `docker compose down` e suba de novo. Se persistir, é um programa
fora do Docker.

---

### O `<` não funciona no meu terminal

**Causa:** você está no PowerShell, onde `<` é um operador reservado.

**Conserto:** use o `cmd.exe`, ou troque por:

```powershell
Get-Content service-grupos\init.sql | docker exec -i trabalho-devops-1-db-grupos-1 psql -U usuario -d grupos_db
```

---

### Diagnóstico rápido

Antes de pedir ajuda, rode e guarde a saída:

```cmd
docker compose ps
docker compose logs --tail 20 service-grupos
docker compose logs --tail 20 service-orquestrador
curl http://localhost:3002/api/v1/health
```

---

## Comandos do dia a dia

```cmd
docker compose ps                              :: o que está no ar
docker compose logs -f service-grupos          :: log ao vivo do seu serviço
docker compose restart service-grupos          :: reiniciar só o seu serviço
docker compose down                            :: derrubar, mantendo os bancos
docker compose down -v                         :: derrubar e APAGAR os bancos
docker exec trabalho-devops-1-service-grupos-1 npm test
```

### Editar código

O compose monta a pasta `./service-grupos` como volume dentro do container: o
código lá dentro **é** o da sua máquina, e o `nodemon -L` fica vigiando. Salvou
um `.js` no editor, o serviço reinicia sozinho em cerca de um segundo.

Você quase nunca precisa de `--build`. Só quando mexer em `package.json` ou
`Dockerfile`:

```cmd
docker compose up --build -d service-grupos
```
