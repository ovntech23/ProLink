const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { verify } = require('jsonwebtoken');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');

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

// Secure WebSocket connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.error('WebSocket connection rejected: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (error) {
    console.error('WebSocket connection rejected: Invalid token');
    next(new Error('Authentication error: Invalid token'));
  }
});

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
      // Find sender ID from connected users
      let senderId;
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          senderId = userId;
          break;
        }
      }

      if (!senderId) {
        console.error('Sender not found in connected users');
        return;
      }

      const { recipientId, content, attachments } = messageData;

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        console.error('Recipient not found');
        return;
      }

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, recipientId]
        });
        await conversation.save();
      }

      // Create and save message
      const message = new Message({
        conversationId: conversation._id,
        sender: senderId,
        recipient: recipientId,
        content,
        attachments
      });

      const savedMessage = await message.save();

      // Populate sender and recipient
      await savedMessage.populate('sender', 'name email role');
      await savedMessage.populate('recipient', 'name email role');

      // Update conversation's updatedAt
      conversation.updatedAt = new Date();
      await conversation.save();

      // Prepare message data for emission
      const messageDataToEmit = {
        id: savedMessage._id,
        conversationId: conversation._id,
        senderId: savedMessage.sender._id,
        recipientId: savedMessage.recipient._id,
        content: savedMessage.content,
        attachments: savedMessage.attachments,
        timestamp: savedMessage.createdAt,
        read: savedMessage.read
      };

      // Emit to recipient if online
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        socket.to(recipientSocketId).emit('receiveMessage', messageDataToEmit);
      }

      // Emit to sender for confirmation
      socket.emit('messageSent', messageDataToEmit);
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
// Configure CORS to allow requests from deployed frontend
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5000', // Backend on same host
    'http://*.sslip.io', // Coolify deployed apps
    'https://*.sslip.io', // Secure Coolify deployed apps
    'http://prolinkafrica.com', // Production domain
    'https://prolinkafrica.com' // Secure production domain
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
