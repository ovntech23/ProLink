const express = require('express');
const router = express.Router();
const { getDrivers, getDriverById, updateDriverProfile } = require('../controllers/driverController');

// Get all drivers
router.get('/', getDrivers);

// Get driver by ID
router.get('/:id', getDriverById);

// Update driver profile
router.put('/:id', updateDriverProfile);

module.exports = router;