# TripManager

Trip manager é um sistema de gestão de viagens feito durante o decorrer do curso de **Bacharelado em Engenharia de Software da UDESC - Alto Vale**<br>
O sistemá é feito usando uma arquitetura de microserviços os padrões de **API Gateway** e **SAGA**.

## SETUP

Ferramentas e tecnologias necessárias:
1. Docker
2. Node.js - *opcional*

Passo a passo:
1. Acessa a pasta secrets na raiz do projeto;
2. Crie todos os secrets mencionados pelo README.md localizado na pasta;
3. Execute na raiz do projeto: `docker compose up --build`;
4. Acesso o container do pgAdmin. **Atenção**: Deve demorar alguns minutos para carregar;
5. Para cada microserviço, execute o arquivo `init.sql` localizado dentro da raiz de cada microserviço;
6. Para cada microserviço, configure o arquivo `.env` com base no arquivo `.env.example` localizado dentro da raiz de cada microserviço;

*Passos opcionais*:

7. Execute `npm install` em cada microserviço com um package.json

## T2 — CI/CD e Observabilidade (service-grupos)

**URLs**

| Ambiente | URL | Swagger |
| :--- | :--- | :---: |
| DEV (`develop`) | https://grupos-dev.onrender.com | Habilitado |
| HOMOL (`main`) | https://grupos-homol.onrender.com | Desabilitado |

Métricas Prometheus em `/metrics` nos dois ambientes.

**Fluxo Git Flow:** `feature/*` → PR para `develop` (deploy em DEV) → PR para `main` (deploy em HOMOL).

**Pipeline** ([service-grupos.yml](.github/workflows/service-grupos.yml), GitHub Actions):
1. Build e testes automatizados (unitários + integração, com Postgres temporário)
2. Análise de qualidade no SonarCloud
3. Build e publicação da imagem Docker no GHCR (`ghcr.io/renanklettenberg/service-grupos`)
4. Deploy automático no Render via deploy hook

**Versionamento:** Semantic Versioning. A versão vem do `package.json`; em `main` a pipeline cria a tag `service-grupos-vX.Y.Z` e a imagem `X.Y.Z` (em `develop`, `X.Y.Z-dev`).

**Segurança:** Dependabot ativo ([dependabot.yml](.github/dependabot.yml)); tokens e deploy hooks ficam em GitHub Secrets (`SONAR_TOKEN_GRUPOS`, `RENDER_HOOK_GRUPOS_DEV`, `RENDER_HOOK_GRUPOS_HOMOL`).

**Observabilidade:** Prometheus + Grafana em [monitoramento/grupos](monitoramento/grupos/). Para subir:

```bash
cd monitoramento/grupos
docker compose up -d
```

Grafana em http://localhost:3004, Prometheus em http://localhost:9092. O dashboard `service-grupos` já é carregado automaticamente.



## Créditos e Contribuições

| Contribuidor | Microserviço | Padrão |
| :--- | :--- | :---: |
| Renan Guilherme Klettenberg | service-usuario, service-viagens | - |
| Júlia Pavanello | service-grupos | API Gateway |
| Hiago Christian Rocha Kloth | service-despesas| SAGA |

