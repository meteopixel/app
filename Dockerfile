FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun run build-web

FROM oven/bun:latest

WORKDIR /app

RUN bun add -g sirv-cli

COPY --from=builder /app/dist ./dist

RUN useradd -u 1001 -m app
USER app

EXPOSE 3000

CMD ["sirv", "dist", "--host", "0.0.0.0", "--port", "3000", "--single"]
