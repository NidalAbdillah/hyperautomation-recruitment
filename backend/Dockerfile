FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY . .

# Build TypeScript ke JavaScript
RUN npm run build

# Hapus dev dependencies
RUN npm prune --production

FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules dan hasil build
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

USER appuser

EXPOSE 5000

# Jalankan file JavaScript hasil compile
CMD ["node", "dist/index.js"]