const express = require('express');
const router = express.Router();
const { getWorkerProfile, updateWorkerProfile, getAllWorkers, getWorkerById } = require('../controllers/workerController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getAllWorkers);

router.route('/profile')
  .get(protect, getWorkerProfile)
  .put(protect, updateWorkerProfile);

router.route('/:id')
  .get(getWorkerById);

module.exports = router;
