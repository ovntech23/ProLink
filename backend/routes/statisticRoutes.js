const express = require('express');
const router = express.Router();
const { getStatistics, getStatisticById, createStatistic, updateStatistic, deleteStatistic } = require('../controllers/statisticController');
const { protect, admin } = require('../middleware/auth');

// GET /api/statistics - Get all active statistics
router.get('/', getStatistics);

// GET /api/statistics/:id - Get statistic by ID
router.get('/:id', getStatisticById);

// POST /api/statistics - Create a new statistic (admin only)
router.post('/', protect, admin, createStatistic);

// PUT /api/statistics/:id - Update a statistic (admin only)
router.put('/:id', protect, admin, updateStatistic);

// DELETE /api/statistics/:id - Delete a statistic (admin only)
router.delete('/:id', protect, admin, deleteStatistic);

module.exports = router;
