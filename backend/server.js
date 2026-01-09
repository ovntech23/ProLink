const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
// TODO: Add route imports here when created

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
// TODO: Add route middleware here when created
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ProLink API' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Frontend and Backend are successfully connected!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prolink', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    console.log('Continuing to start server without database connection...');
  });

// Start server regardless of database connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;