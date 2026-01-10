# Use Node.js 20 as base image for MERN stack
FROM node:20-alpine

# Install curl for health check
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy package files for backend
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy frontend source
COPY frontend/ ./frontend/

# Install frontend dependencies and build with production environment variables
# Set VITE_API_BASE_URL to empty string for relative URLs in production
RUN cd frontend && npm ci && VITE_API_BASE_URL= npm run build

# Move built frontend to backend public directory
RUN mv frontend/dist backend/public

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app files to non-root user
RUN chown -R nextjs:nodejs /app/backend
USER nextjs

# Expose port
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Add health check with curl and better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
