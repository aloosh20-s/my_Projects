const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getServices)
  .post(protect, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
