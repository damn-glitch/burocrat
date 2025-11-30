# Dockerfile
FROM node:22-alpine

# Установить curl
RUN apk add --no-cache curl

# Остальные шаги
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY .env.dev ./.env

RUN npx prisma generate --schema=prisma/schema.dev.prisma
