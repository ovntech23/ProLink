const Feature = require('../models/Feature');

// Get all active features
exports.getFeatures = async (req, res) => {
  try {
    const features = await Feature.find({ isActive: true }).sort({ order: 1 });
    res.json(features);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching features', error: error.message });
  }
};

// Get feature by ID
exports.getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.json(feature);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feature', error: error.message });
  }
};

// Create a new feature
exports.createFeature = async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await feature.save();
    res.status(201).json(feature);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating feature', error: error.message });
  }
};

// Update a feature
exports.updateFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.json(feature);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating feature', error: error.message });
  }
};

// Delete a feature
exports.deleteFeature = async (req, res) => {
  try {
    const feature = await Feature.findByIdAndDelete(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: 'Feature not found' });
    }
    res.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feature', error: error.message });
  }
};