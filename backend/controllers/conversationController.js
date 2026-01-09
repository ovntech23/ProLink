const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email role')
    .sort({ updatedAt: -1 });

    // Add last message and unread count for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Find the other participant (not the current user)
        const otherParticipant = conversation.participants.find(
          participant => participant._id.toString() !== req.user.id
        );

        // Get the last message in this conversation
        const lastMessage = await Message.findOne({
          conversationId: conversation._id
        })
        .sort({ createdAt: -1 });

        // Get unread message count for this conversation
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          recipient: req.user.id,
          read: false
        });

        return {
          ...conversation.toObject(),
          otherParticipant,
          lastMessage,
          unreadCount
        };
      })
    );

    res.json(conversationsWithDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Start a new conversation with a user
// @route   POST /api/conversations
// @access  Private (Admin only)
const startConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if user exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId] }
    });

    if (existingConversation) {
      return res.json({
        conversation: existingConversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      participants: [req.user.id, participantId]
    });

    const savedConversation = await conversation.save();

    // Populate participants
    await savedConversation.populate('participants', 'name email role');

    res.status(201).json({
      conversation: savedConversation,
      message: 'Conversation started successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get messages for this conversation
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .sort({ createdAt: 1 });

    // Mark messages as read if they belong to the current user
    await Message.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  startConversation,
  getMessages
};