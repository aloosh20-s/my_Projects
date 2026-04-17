const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  respondToRequest 
} = require('../controllers/serviceRequestController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id', protect, respondToRequest);

module.exports = router;
