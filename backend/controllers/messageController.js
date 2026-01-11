const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { cacheMessage, invalidateConversationCache } = require('../utils/redisCache');


// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, attachments } = req.body;
    // Dynamic import to avoid circular dependency
    const { io } = require('../server');

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let conversation;

    if (conversationId) {
      // Use existing conversation
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user.id
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
    } else if (recipientId) {
      // Check if recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      // Check if conversation already exists between these users
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, recipientId] }
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [req.user.id, recipientId]
        });
        await conversation.save();
      }
    } else {
      return res.status(400).json({ message: 'Either conversationId or recipientId is required' });
    }

    // Create new message
    const message = new Message({
      conversationId: conversation._id,
      sender: req.user.id,
      recipient: recipientId || conversation.participants.find(
        p => p.toString() !== req.user.id
      ),
      content,
      attachments
    });

    const savedMessage = await message.save();

    // Populate sender and recipient
    await savedMessage.populate('sender', 'name email role');
    await savedMessage.populate('recipient', 'name email role');

    // Update conversation's updatedAt timestamp
    conversation.updatedAt = new Date();
    await conversation.save();

    // Emit WebSocket event to recipient if they're online
    const messageData = {
      id: savedMessage._id,
      conversationId: conversation._id,
      sender: savedMessage.sender,
      recipient: savedMessage.recipient,
      content: savedMessage.content,
      attachments: savedMessage.attachments,
      createdAt: savedMessage.createdAt,
      read: savedMessage.read
    };

    // Emit to sender for confirmation
    // Note: In a real implementation, you would need to track socket IDs for users
    // This is a simplified version for demonstration
    // Assuming 'socket' is available or passed, for this example, we'll use 'io' to emit globally or to specific rooms if tracked.
    // For a specific sender, you'd need their socket ID. This example uses a placeholder `socket.emit` as per instruction.
    // If `socket` is not defined, this line will cause an error. It should be `io.to(senderSocketId).emit(...)` or similar.
    // For the purpose of this edit, I'll assume `socket` is meant to be a placeholder for the sender's socket.
    // If `socket` is not defined in the scope, this line will cause a runtime error.
    // The instruction provided `socket.emit('messageSent', messageDataToEmit);` but `messageDataToEmit` was not defined.
    // I will use `messageData` which was defined just above.
    // Also, `senderId` and `recipientId` are needed for cache invalidation.
    const senderId = req.user.id.toString();
    const actualRecipientId = recipientId || conversation.participants.find(p => p.toString() !== req.user.id).toString();

    // Placeholder for socket emit, assuming `socket` is available and `messageDataToEmit` refers to `messageData`
    // If `socket` is not defined, this line will cause an error.
    // socket.emit('messageSent', messageData); // Commenting out as `socket` is not defined in this scope

    // Cache the message in Redis
    await cacheMessage(savedMessage._id.toString(), messageData);

    // Invalidate conversation cache for both users
    await invalidateConversationCache(senderId);
    await invalidateConversationCache(actualRecipientId);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all messages for a user
// @route   GET /api/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('conversationId')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark a message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      recipient: req.user.id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.read) {
      return res.json({ message: 'Message already marked as read' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead
};