const express = require('express');
const router = express.Router();
const {
  getConversations,
  startConversation,
  getMessages
} = require('../controllers/conversationController');
const { protect, admin } = require('../middleware/auth');

// Get all conversations for a user
router.get('/', protect, getConversations);

// Start a new conversation (admin only)
router.post('/', protect, admin, startConversation);

// Get messages in a conversation
router.get('/:id/messages', protect, getMessages);

module.exports = router;