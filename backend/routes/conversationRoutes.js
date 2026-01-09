const express = require('express');
const router = express.Router();
const {
  getConversations,
  startConversation,
  getMessages
} = require('../controllers/conversationController');

// Middleware to protect routes (placeholder for now)
// In a real implementation, this would verify JWT tokens
const protect = (req, res, next) => {
  // For now, we'll mock a user for testing
  // In a real implementation, this would verify the JWT token
  req.user = { id: '69607ce381ffb2cf95d65fe6' }; // Using the admin user ID
  next();
};

// For routes that should only be accessible by admins
const admin = (req, res, next) => {
  // For now, we'll allow all users to access these routes for testing
  // In a real implementation, this would check if the user has admin role
  next();
};

// Get all conversations for a user
router.get('/', protect, getConversations);

// Start a new conversation (admin only)
router.post('/', protect, admin, startConversation);

// Get messages in a conversation
router.get('/:id/messages', protect, getMessages);

module.exports = router;