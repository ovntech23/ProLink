const User = require('../models/User');

// @desc Get all drivers
// @route GET /api/drivers
// @access Public
const getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' });
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