const express = require('express');
const router = express.Router();
const { getContacts, getConversation, sendMessage, getUserDetails } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: { message: 'Too many messages sent, please wait a moment.' }
});

router.get('/contacts', protect, getContacts);
router.get('/user/:id', protect, getUserDetails);
router.get('/:userId', protect, getConversation);
router.post('/', protect, chatLimiter, sendMessage);

module.exports = router;
