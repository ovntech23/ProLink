# Use Node.js 18 as base image for MERN stack
FROM node:18-alpine

# Set working directory
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

# Expose port
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api', (res) => {if (res.statusCode !== 200) process.exit(1)})"

# Start the application
CMD ["npm", "start"]
