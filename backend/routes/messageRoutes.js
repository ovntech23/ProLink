const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markAsRead,
  addReaction
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Send a new message
router.post('/', protect, sendMessage);

// Get all messages for a user
router.get('/', protect, getMessages);

// Mark a message as read
router.put('/:id/read', protect, markAsRead);

// Add reaction to message
router.post('/:id/react', protect, addReaction);

module.exports = router;