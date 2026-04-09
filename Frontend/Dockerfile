# ============================================
# KOMUNITIP FRONTEND - Multi-stage Dockerfile
# ============================================

# --- STAGE 1: DEVELOPMENT (Hot-reload untuk ngoding) ---
FROM node:22-alpine AS development

WORKDIR /usr/src/app

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm ci

# Copy seluruh kode sumber
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Hot-reload mode dengan host 0.0.0.0 agar accessible dari luar container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# --- STAGE 2: BUILDER (Build production bundle) ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build production bundle
RUN npm run build


# --- STAGE 3: PRODUCTION (Nginx serve static files) ---
FROM nginx:alpine AS production

# Copy built files ke nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, default works for SPA)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
