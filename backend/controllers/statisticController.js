const Statistic = require('../models/Statistic');

// Get all active statistics
exports.getStatistics = async (req, res) => {
  try {
    const statistics = await Statistic.find({ isActive: true }).sort({ order: 1 });
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};

// Get statistic by ID
exports.getStatisticById = async (req, res) => {
  try {
    const statistic = await Statistic.findById(req.params.id);
    if (!statistic) {
      return res.status(404).json({ message: 'Statistic not found' });
    }
    res.json(statistic);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistic', error: error.message });
  }
};

// Create a new statistic
exports.createStatistic = async (req, res) => {
  try {
    const statistic = new Statistic(req.body);
    await statistic.save();
    res.status(201).json(statistic);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating statistic', error: error.message });
  }
};

// Update a statistic
exports.updateStatistic = async (req, res) => {
  try {
    const statistic = await Statistic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!statistic) {
      return res.status(404).json({ message: 'Statistic not found' });
    }
    res.json(statistic);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating statistic', error: error.message });
  }
};

// Delete a statistic
exports.deleteStatistic = async (req, res) => {
  try {
    const statistic = await Statistic.findByIdAndDelete(req.params.id);
    if (!statistic) {
      return res.status(404).json({ message: 'Statistic not found' });
    }
    res.json({ message: 'Statistic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting statistic', error: error.message });
  }
};