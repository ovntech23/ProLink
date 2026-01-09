const express = require('express');
const router = express.Router();
const { 
  getStatistics, 
  getStatisticById, 
  createStatistic, 
  updateStatistic, 
  deleteStatistic 
} = require('../controllers/statisticController');

// GET /api/statistics - Get all active statistics
router.get('/', getStatistics);

// GET /api/statistics/:id - Get statistic by ID
router.get('/:id', getStatisticById);

// POST /api/statistics - Create a new statistic
router.post('/', createStatistic);

// PUT /api/statistics/:id - Update a statistic
router.put('/:id', updateStatistic);

// DELETE /api/statistics/:id - Delete a statistic
router.delete('/:id', deleteStatistic);

module.exports = router;