const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, requireApprovedWorker, requireApprovedWorkerOrAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getServices)
  .post(protect, requireApprovedWorker, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, requireApprovedWorkerOrAdmin, updateService)
  .delete(protect, requireApprovedWorkerOrAdmin, deleteService);

module.exports = router;
