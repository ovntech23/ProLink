const express = require('express');
const router = express.Router();
const {
  getConversations,
  startConversation,
  createGroupConversation,
  getMessages
} = require('../controllers/conversationController');
const { protect, admin } = require('../middleware/auth');

// Get all conversations for a user
router.get('/', protect, getConversations);

// Start a new conversation (admin only)
router.post('/', protect, admin, startConversation);

// Create a group conversation (admin only)
router.post('/group', protect, admin, createGroupConversation);

// Get messages in a conversation
router.get('/:id/messages', protect, getMessages);

module.exports = router;