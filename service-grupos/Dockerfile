FROM node:24

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Versão e commit vêm da pipeline (build-args); assim o /api/v1/version mostra
# exatamente o que o GitHub Actions publicou.
ARG APP_VERSION
ARG APP_COMMIT
ENV APP_VERSION=$APP_VERSION
ENV APP_COMMIT=$APP_COMMIT

CMD ["node", "src/server.js"]
