const express = require('express');
const router = express.Router();
const { Report } = require('../models');
const { protect } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 reports per hour per IP
  message: { message: 'Too many reports submitted. Please try again later.' }
});

router.post('/', protect, reportLimiter, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;
    
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'Missing report data' });
    }

    const report = await Report.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
