FROM node:25-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["node", "src/infrastructure/server.js"]