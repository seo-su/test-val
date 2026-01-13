# Multi-stage Dockerfile for full-stack deployment
# Build from repository root

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY gamemaster-assistant/frontend/package*.json ./
RUN npm ci
COPY gamemaster-assistant/frontend/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY gamemaster-assistant/backend/package*.json ./
RUN npm ci
COPY gamemaster-assistant/backend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# Copy frontend build to serve statically
COPY --from=frontend-builder /app/frontend/dist ./public

# Install only production dependencies
RUN npm prune --production

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
