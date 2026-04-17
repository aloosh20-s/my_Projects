const express = require('express');
const router = express.Router();
const { getContacts, getConversation, sendMessage, getUserDetails } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/contacts', protect, getContacts);
router.get('/user/:id', protect, getUserDetails);
router.get('/:userId', protect, getConversation);
router.post('/', protect, sendMessage);

module.exports = router;
