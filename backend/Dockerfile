FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++


COPY package*.json ./
RUN npm install


COPY . .


RUN npm prune --production


FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser


COPY --from=builder --chown=appuser:appgroup /app .

EXPOSE 5000

CMD ["node", "server.js"]