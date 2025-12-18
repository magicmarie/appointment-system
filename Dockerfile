# Multi-stage build for Node + TypeScript app
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy package manifests and install production deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --production --no-audit --no-fund

# Copy built output
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
