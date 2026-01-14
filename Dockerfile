# Build Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN VITE_API_BASE_URL="" npm run build

# Build Stage 2: Prepare Backend
FROM node:20-alpine AS backend-preparer
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Stage 3: Final Production Image
FROM node:20-alpine
RUN apk add --no-cache curl
WORKDIR /app/backend

# Copy built frontend from Stage 1 to backend/public
COPY --from=frontend-builder /app/frontend/dist ./public

# Copy backend files from Stage 2
COPY --from=backend-preparer /app/backend ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001 && \
  chown -R nextjs:nodejs /app/backend

USER nextjs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]
