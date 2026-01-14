const User = require('../models/User');

// Import io instance for WebSocket events
// Import io instance for WebSocket events - Removed circular dependency
// io is now retrieved from req.app.get('io') in controllers

// @desc Get all drivers
// @route GET /api/drivers
// @access Public
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-vehicleImage');
    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get driver by ID
// @route GET /api/drivers/:id
// @access Public
const getDriverById = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
    if (driver) {
      res.json(driver);
    } else {
      res.status(404).json({ message: 'Driver not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update driver profile
// @route PUT /api/drivers/:id
// @access Private (Driver only)
const updateDriverProfile = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Update driver fields
    const {
      status,
      vehicleType,
      vehiclePlate,
      vehicleModel,
      vehicleCategory,
      trailerPlate,
      currentLocation,
      phone
    } = req.body;

    driver.status = status || driver.status;
    driver.vehicleType = vehicleType || driver.vehicleType;
    driver.vehiclePlate = vehiclePlate || driver.vehiclePlate;
    driver.vehicleModel = vehicleModel || driver.vehicleModel;
    driver.vehicleCategory = vehicleCategory || driver.vehicleCategory;
    driver.trailerPlate = trailerPlate || driver.trailerPlate;
    driver.currentLocation = currentLocation || driver.currentLocation;
    driver.phone = phone || driver.phone;

    const updatedDriver = await driver.save();

    // Emit WebSocket event for real-time updates
    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('driverUpdate', {
        id: updatedDriver._id,
        status: updatedDriver.status,
        vehicleType: updatedDriver.vehicleType,
        vehiclePlate: updatedDriver.vehiclePlate,
        vehicleModel: updatedDriver.vehicleModel,
        vehicleCategory: updatedDriver.vehicleCategory,
        trailerPlate: updatedDriver.trailerPlate,
        currentLocation: updatedDriver.currentLocation,
        phone: updatedDriver.phone,
        updatedAt: updatedDriver.updatedAt
      });
    }

    res.json(updatedDriver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  updateDriverProfile
};