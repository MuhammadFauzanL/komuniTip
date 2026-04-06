# ============================================
# KOMUNITIP BACKEND - Multi-stage Dockerfile
# ============================================

# --- STAGE 1: DEVELOPMENT (Hot-reload untuk ngoding) ---
FROM node:22-alpine AS development

WORKDIR /usr/src/app

# Copy package files dan install dependencies (deterministic via npm ci)
COPY package*.json ./
RUN npm ci

# Copy seluruh kode sumber
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Hot-reload mode
CMD ["npm", "run", "start:dev"]


# --- STAGE 2: BUILDER (Compile TypeScript → JavaScript) ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client (dibutuhkan saat build)
RUN npx prisma generate

# Compile TypeScript
RUN npm run build


# --- STAGE 3: PRODUCTION (Optimized untuk deploy ke VPS) ---
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output dari builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma client yang sudah di-generate
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Security: Jalankan sebagai non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/main"]