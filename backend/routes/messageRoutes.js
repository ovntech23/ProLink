const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead
} = require('../controllers/messageController');

// Middleware to protect routes (placeholder for now)
// In a real implementation, this would verify JWT tokens
const protect = (req, res, next) => {
  // For now, we'll mock a user for testing
  // In a real implementation, this would verify the JWT token
  req.user = { id: '69607ce381ffb2cf95d65fe6' }; // Using the admin user ID
  next();
};

// Send a new message
router.post('/', protect, sendMessage);

// Get all messages for a user
router.get('/', protect, getMessages);

// Mark a message as read
router.put('/:id/read', protect, markAsRead);

module.exports = router;