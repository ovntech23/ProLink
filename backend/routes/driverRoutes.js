const express = require('express');
const router = express.Router();
const { getDrivers, getDriverById, updateDriverProfile } = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// Get all drivers
router.get('/', getDrivers);

// Get driver by ID
router.get('/:id', getDriverById);

// Update driver profile (driver only)
router.put('/:id', protect, authorize('driver'), updateDriverProfile);

module.exports = router;
