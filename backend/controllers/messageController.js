const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const {
  cacheMessage,
  invalidateConversationCache,
  cacheMessageHistory,
  getCachedMessageHistory,
  invalidateMessageHistoryCache
} = require('../utils/redisCache');

// @desc Send a new message
// @route POST /api/messages
// @access Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, content, attachments } = req.body;
    // Get io instance from app settings to avoid circular dependency
    const io = req.app.get('io');

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    let conversation;
    if (conversationId) {
      // Use existing conversation
      conversation = await Conversation.findOne({ _id: conversationId, participants: req.user.id });
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
      conversation = await Conversation.findOne({ participants: { $all: [req.user.id, recipientId] } });
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

    // Emit message to sender for confirmation
    // Emit to sender's socket
    // Emit message to sender for confirmation using their User ID room
    io.to(req.user.id.toString()).emit('messageSent', messageData);

    // Emit message to recipient using their User ID room
    // Note: recipientId might be null if using conversationId, so use actualRecipientId derived above (but I need to ensure it's defined before this block or re-derive it)
    const targetRecipientId = recipientId || conversation.participants.find(p => p.toString() !== req.user.id).toString();

    io.to(targetRecipientId).emit('receiveMessage', messageData);
    io.to(targetRecipientId).emit('new-message', messageData); // Strict adherence to new architecture event names

    // Cache the message in Redis
    await cacheMessage(savedMessage._id.toString(), messageData);

    // Invalidate conversation and message history cache for both users
    const senderId = req.user.id.toString();
    // actualRecipientId is already defined above
    await invalidateConversationCache(senderId);
    await invalidateConversationCache(targetRecipientId);
    await invalidateMessageHistoryCache(senderId);
    await invalidateMessageHistoryCache(targetRecipientId);

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all messages for a user
// @route GET /api/messages
// @access Private
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    // Check cache first
    const cachedMessages = await getCachedMessageHistory(userId);
    if (cachedMessages) {
      return res.json(cachedMessages);
    }

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

    // Cache the results
    await cacheMessageHistory(userId, messages);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Mark a message as read
// @route PUT /api/messages/:id/read
// @access Private
const markAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findOne({ _id: messageId, recipient: req.user.id });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.read) {
      return res.json({ message: 'Message already marked as read' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    // Invalidate message history cache for both sender and recipient
    await invalidateMessageHistoryCache(message.sender.toString());
    await invalidateMessageHistoryCache(message.recipient.toString());

    // Notify the sender that the message has been read
    const io = req.app.get('io');
    if (io) {
      io.to(message.sender.toString()).emit('messageRead', {
        messageId: message._id,
        conversationId: message.conversationId,
        readAt: message.readAt
      });
    }

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
