const Cargo = require('../models/Cargo');

// Get all active cargo items
exports.getCargos = async (req, res) => {
  try {
    const cargos = await Cargo.find({ isActive: true }).sort({ order: 1 });
    res.json(cargos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cargo items', error: error.message });
  }
};

// Get cargo by ID
exports.getCargoById = async (req, res) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo item not found' });
    }
    res.json(cargo);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cargo item', error: error.message });
  }
};

// Create a new cargo item
exports.createCargo = async (req, res) => {
  try {
    const cargo = new Cargo(req.body);
    await cargo.save();

    // Emit WebSocket event for real-time updates (Standalone DB support)
    const io = req.app.get('io');
    if (io) {
      io.emit('data-updated', {
        type: 'cargo',
        action: 'create',
        data: cargo
      });
    }

    res.status(201).json(cargo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error creating cargo item', error: error.message });
  }
};

// Update a cargo item
exports.updateCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo item not found' });
    }
    res.json(cargo);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({ message: 'Error updating cargo item', error: error.message });
  }
};

// Delete a cargo item
exports.deleteCargo = async (req, res) => {
  try {
    const cargo = await Cargo.findByIdAndDelete(req.params.id);
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo item not found' });
    }
    res.json({ message: 'Cargo item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cargo item', error: error.message });
  }
};