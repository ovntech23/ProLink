const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const featureRoutes = require('./routes/featureRoutes');

// Initialize app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
const connectedUsers = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle sending a message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Emit the message to the recipient if they're online
      const recipientSocketId = connectedUsers.get(messageData.recipientId);
      if (recipientSocketId) {
        socket.to(recipientSocketId).emit('receiveMessage', messageData);
      }
      
      // Also emit to sender for confirmation
      socket.emit('messageSent', messageData);
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const recipientSocketId = connectedUsers.get(data.recipientId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('userTyping', data);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from connected users map
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting middleware
app.use(generalLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Serve static files from public directory (built frontend)
app.use(express.static('public'));

// Apply stricter rate limiting to authentication routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/statistics', statisticRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/features', featureRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ProLink API' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Frontend and Backend are successfully connected!' });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Continuing to start server without database connection...');
  }
};

// Initialize database connection
connectDB();

// Export io instance for use in controllers
module.exports = { app, io };

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
