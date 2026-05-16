const { Message, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get standard user details for new conversation
// @route   GET /api/messages/user/:id
// @access  Private
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'profileImage', 'role']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contacts (users the current user has chatted with)
// @route   GET /api/messages/contacts
// @access  Private
const getContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profileImage', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'profileImage', 'role'] }
      ]
    });

    const contactsMap = new Map();

    // Loop through messages and build a unique contacts map
    for (const msg of messages) {
      const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const contactUser = msg.senderId === userId ? msg.receiver : msg.sender;

      // Only add the contact if it hasn't been added yet (since ordered by DESC, this is the latest msg)
      if (!contactsMap.has(contactId) && contactUser) {
        contactsMap.set(contactId, {
          id: contactUser.id,
          name: contactUser.name,
          avatar: contactUser.profileImage,
          role: contactUser.role,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unread: false // Add logic if you want unread counts
        });
      }
    }

    res.json(Array.from(contactsMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const userId1 = req.user.id;
    const userId2 = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profileImage'] }
      ]
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    let sanitizedMessage = message.trim();
    if (!receiverId || !sanitizedMessage) {
      return res.status(400).json({ message: 'Receiver and message text are required' });
    }

    if (sanitizedMessage.length > 1000) {
      return res.status(400).json({ message: 'Message is too long (max 1000 characters)' });
    }

    // Basic XSS protection
    sanitizedMessage = sanitizedMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: sanitizedMessage
    });

    // We can populate the sender details for immediate return
    const populatedMessage = await Message.findByPk(newMessage.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profileImage'] }]
    });

    // Emit via socket
    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('receive_message', populatedMessage);
    // Also emit back to sender's own room just in case they have multiple tabs open
    io.to(`user_${senderId}`).emit('receive_message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContacts,
  getConversation,
  sendMessage,
  getUserDetails
};
