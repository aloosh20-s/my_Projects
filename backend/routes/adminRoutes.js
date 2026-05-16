const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAllUsers,
  getAllWorkers,
  updateUserStatus,
  getAllServices,
  disableService,
  getAllBookings,
  getAllReports,
  updateReportStatus,
  getSecurityLogs
} = require('../controllers/adminController');

router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.get('/workers', getAllWorkers);
router.put('/users/:id/status', updateUserStatus);
router.get('/services', getAllServices);
router.delete('/services/:id', disableService);
router.get('/bookings', getAllBookings);
router.get('/reports', getAllReports);
router.put('/reports/:id/status', updateReportStatus);
router.get('/security-logs', getSecurityLogs);

module.exports = router;
