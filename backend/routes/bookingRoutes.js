const express = require('express');
const router = express.Router();
const { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 bookings per 15 min
  message: { message: 'Too many bookings created, please try again later.' }
});

router.route('/')
  .post(protect, bookingLimiter, createBooking);

router.route('/client')
  .get(protect, getCustomerBookings);

router.route('/worker')
  .get(protect, getWorkerBookings);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

module.exports = router;
