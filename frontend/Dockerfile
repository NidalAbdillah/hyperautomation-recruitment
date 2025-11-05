# --- TAHAP 1: BUILDER ---
FROM node:22-alpine AS builder
WORKDIR /app

# Deklarasikan argumen yang akan diterima
ARG VITE_API_BASE_URL

# Salin package.json dan install
COPY package*.json ./
RUN npm install

# Salin sisa kode
COPY . .

# --- PERBAIKAN UTAMA ---
# Teruskan ARG langsung ke perintah build. Ini cara paling eksplisit.
RUN VITE_API_BASE_URL=${VITE_API_BASE_URL} npm run build

# --- TAHAP 2: WEB SERVER (SERVE) ---
FROM node:22-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist

RUN npm install -g serve
USER appuser

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
