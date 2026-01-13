const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { verify } = require('jsonwebtoken');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');
const { redisClient, redisPub, redisSub } = require('./config/redis');
const { setUserOnline, setUserOffline, getOnlineUsers } = require('./utils/redisCache');

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
const shipmentRoutes = require('./routes/shipmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // Local development
      'http://localhost:5000', // Backend on same host
      'http://*.sslip.io', // Coolify deployed apps
      'https://*.sslip.io', // Secure Coolify deployed apps
      'http://prolinkafrica.com', // Production domain
      'https://prolinkafrica.com', // Secure production domain
      'https://www.prolinkafrica.com' // Secure production domain (www)
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  adapter: createAdapter(redisPub, redisSub)
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
    console.log('WebSocket JWT decoded:', decoded); // Debug log
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (error) {
    console.error('WebSocket connection rejected: Invalid token', error.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', async () => {
    console.log('Socket join called, socket.user:', socket.user); // Debug log
    // Use the verified user from the JWT token instead of client-provided userId
    if (socket.user && socket.user.userId) {
      const userId = socket.user.userId;

      // Join a room with the user's ID for robust message delivery
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);

      connectedUsers.set(userId, socket.id);

      // Set user as online in Redis
      await setUserOnline(userId, socket.id);

      // Broadcast online users to all clients
      const onlineUsers = await getOnlineUsers();
      io.emit('onlineUsers', onlineUsers);

      console.log(`User ${userId} joined with socket ${socket.id}`);
    } else {
      console.error('Socket join attempted without valid user authentication');
      socket.emit('error', { message: 'Authentication required' });
    }
  });

  // Handle subscription to real-time updates
  socket.on('subscribeToUpdates', (data) => {
    const { updateTypes } = data;
    if (updateTypes && Array.isArray(updateTypes)) {
      updateTypes.forEach(type => {
        socket.join(`${type}_updates`);
        console.log(`User ${socket.user?.userId} subscribed to ${type}_updates`);
      });
    }
  });

  // Handle shipment updates
  socket.on('shipmentUpdated', (shipmentData) => {
    console.log('Shipment update broadcast:', shipmentData);
    io.to('shipment_updates').emit('shipmentUpdate', shipmentData);
  });

  // Handle driver updates
  socket.on('driverUpdated', (driverData) => {
    console.log('Driver update broadcast:', driverData);
    io.to('driver_updates').emit('driverUpdate', driverData);
  });

  // Handle user updates
  socket.on('userUpdated', (userData) => {
    console.log('User update broadcast:', userData);
    io.to('user_updates').emit('userUpdate', userData);
  });

  // Handle sending a message
  socket.on('sendMessage', async (messageData) => {
    try {
      console.log('sendMessage event received:', messageData);

      // Use the verified user from the JWT token
      const senderId = socket.user?.userId;

      if (!senderId) {
        console.error('Sender not authenticated');
        socket.emit('error', { message: 'Authentication required to send messages' });
        return;
      }

      const { recipientId, content, attachments } = messageData;

      if (!recipientId) {
        console.error('No recipientId provided');
        return;
      }

      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        console.error('Recipient not found:', recipientId);
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

      console.log(`Emitting message to recipient room: ${recipientId}`);

      // Emit to recipient using their User ID room (more robust with Redis Adapter)
      io.to(recipientId).emit('receiveMessage', messageDataToEmit);
      io.to(recipientId).emit('new-message', messageDataToEmit);

      // Emit to sender for confirmation
      socket.emit('messageSent', messageDataToEmit);
    } catch (error) {
      console.error('Error sending message via WebSocket:', error);
      socket.emit('error', { message: 'Failed to send message: ' + error.message });
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
  socket.on('disconnect', async () => {
    // Remove user from connected users map
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);

        // Set user as offline in Redis
        await setUserOffline(userId);

        // Broadcast updated online users
        const onlineUsers = await getOnlineUsers();
        io.emit('onlineUsers', onlineUsers);

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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:", "data:", "blob:"],
      workerSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "https:", "data:", "blob:"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      childSrc: ["'self'", "blob:"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Middleware
// Configure CORS to allow requests from deployed frontend
const corsOptions = {
  origin: [
    'http://localhost:5173', // Local development
    'http://localhost:5000', // Backend on same host
    'http://*.sslip.io', // Coolify deployed apps
    'https://*.sslip.io', // Secure Coolify deployed apps
    'http://prolinkafrica.com', // Production domain
    'https://prolinkafrica.com', // Secure production domain
    'https://www.prolinkafrica.com' // Secure production domain (www)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Serve static files from public directory (built frontend) - DISABLED for API-only mode
// app.use(express.static('public'));

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
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);

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

// Catch all handler: 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('❌ MongoDB URI used:', process.env.MONGODB_URI);

    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Server cannot start without database connection in production. Exiting...');
      process.exit(1);
    } else {
      console.warn('⚠️  Warning: Running without database connection in development mode.');
      console.warn('⚠️  Please start MongoDB or update MONGODB_URI in your .env file.');
      console.warn('💡 Tip: You can use Docker to run MongoDB locally:');
      console.warn('   docker-compose up -d mongodb');
    }
  }
};

// Initialize database connection
connectDB().then(() => {
  // Set up MongoDB change streams after successful connection
  setupChangeStreams();
});

// Set up MongoDB change streams for real-time updates
const setupChangeStreams = () => {
  try {
    // Shipment change stream
    const shipmentCollection = mongoose.connection.collection('shipments');
    const shipmentChangeStream = shipmentCollection.watch();

    shipmentChangeStream.on('change', (change) => {
      console.log('Shipment change detected:', change.operationType, change.documentKey);

      // Emit different events based on operation type
      let action = 'unknown';
      let data = {};

      switch (change.operationType) {
        case 'insert':
          action = 'create';
          data = { id: change.fullDocument._id, ...change.fullDocument };
          io.emit('shipmentCreated', data);
          break;
        case 'update':
        case 'replace':
          action = 'update';
          data = { id: change.documentKey._id, ...change.fullDocument };
          io.emit('shipmentUpdate', data);
          break;
        case 'delete':
          action = 'delete';
          data = { id: change.documentKey._id };
          io.emit('shipmentDeleted', data);
          break;
      }

      // Generic event: data-updated
      if (action !== 'unknown') {
        io.emit('data-updated', {
          type: 'shipment',
          action,
          data
        });
      }
    });

    // Driver/User change stream
    const userCollection = mongoose.connection.collection('users');
    const userChangeStream = userCollection.watch();

    userChangeStream.on('change', (change) => {
      console.log('User/Driver change detected:', change.operationType, change.documentKey);

      // Emit different events based on operation type
      let action = 'unknown';
      let data = {};

      switch (change.operationType) {
        case 'insert':
          action = 'create';
          data = { id: change.fullDocument._id, ...change.fullDocument };
          io.emit('userCreated', data);
          break;
        case 'update':
        case 'replace':
          action = 'update';
          data = { id: change.documentKey._id, ...change.fullDocument };
          io.emit('userUpdate', data);
          break;
        case 'delete':
          action = 'delete';
          data = { id: change.documentKey._id };
          io.emit('userDeleted', data);
          break;
      }

      // Generic event: data-updated
      if (action !== 'unknown') {
        io.emit('data-updated', {
          type: 'user', // Note: this covers drivers too as they are users
          action,
          data
        });
      }
    });

    console.log('✅ MongoDB change streams initialized');
  } catch (error) {
    console.error('❌ Error setting up change streams:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export io instance for use in controllers (after server initialization to avoid circular dependency)
module.exports = { app, io, server };
