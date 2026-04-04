const express = require('express');
const router = express.Router();
const { createBooking, getCustomerBookings, getWorkerBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createBooking);

router.route('/client')
  .get(protect, getCustomerBookings);

router.route('/worker')
  .get(protect, getWorkerBookings);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

module.exports = router;
