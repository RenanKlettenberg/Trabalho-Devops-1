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

## Créditos e Contribuições

| Contribuidor | Microserviço | Padrão |
| :--- | :--- | :---: |
| Renan Guilherme Klettenberg | service-usuario, service-viagens | - |
| Júlia Pavanello | service-despesas | API Gateway |
| Hiago Christian Rocha Kloth | service-grupos | SAGA |

