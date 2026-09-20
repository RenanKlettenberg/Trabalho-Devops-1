FROM node:24-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]
