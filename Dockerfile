# Use Node.js 18 as base image
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

# Install frontend dependencies and build
RUN cd frontend && npm ci && npm run build

# Move built frontend to backend public directory
RUN mv frontend/dist backend/public

# Expose port
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Start the application
CMD ["npm", "start"]