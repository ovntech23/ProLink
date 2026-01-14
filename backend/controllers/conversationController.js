const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { cacheConversation, getCachedConversation, invalidateConversationCache } = require('../utils/redisCache');

// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    // Check cache first
    const cachedConversations = await getCachedConversation(userId);
    if (cachedConversations) {
      return res.json(cachedConversations);
    }

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

    // Cache the results
    await cacheConversation(userId, conversationsWithDetails);

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

    // Invalidate cache for both participants
    await invalidateConversationCache(req.user.id.toString());
    await invalidateConversationCache(participantId.toString());

    res.status(201).json({
      conversation: savedConversation,
      message: 'Conversation started successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a group conversation
// @route   POST /api/conversations/group
// @access  Private (Admin only)
const createGroupConversation = async (req, res) => {
  try {
    const { name, participants } = req.body;

    // Validate input
    if (!name || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'Name and participants array are required' });
    }

    // Verify all participants exist
    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ message: 'One or more participants not found' });
    }

    // Add current user (admin) to participants if not already included
    const participantIds = participants.map(p => p.toString());
    if (!participantIds.includes(req.user.id.toString())) {
      participantIds.push(req.user.id.toString());
    }

    // Create new group conversation
    const conversation = new Conversation({
      participants: participantIds,
      isGroup: true,
      name,
      groupAdmin: req.user.id
    });

    const savedConversation = await conversation.save();

    // Populate participants
    await savedConversation.populate('participants', 'name email role');

    // Invalidate cache for all participants
    for (const participantId of participantIds) {
      await invalidateConversationCache(participantId);
    }

    res.status(201).json({
      conversation: savedConversation,
      message: 'Group conversation created successfully'
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
    const result = await Message.updateMany(
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

    // If any messages were updated, invalidate conversation cache
    if (result.matchedCount > 0) {
      await invalidateConversationCache(req.user.id.toString());
      // Also might need to invalidate history cache if used
    }

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversations,
  startConversation,
  createGroupConversation,
  getMessages
};