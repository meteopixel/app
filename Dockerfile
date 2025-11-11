FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN npm install

COPY . .
RUN npm run build-web

FROM oven/bun:alpine

WORKDIR /app

RUN bun add -g sirv-cli

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "3000", "--single"]
