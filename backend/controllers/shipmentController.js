const Shipment = require('../models/Shipment');

// Import io instance for WebSocket events
let io;
try {
  const serverModule = require('../server');
  io = serverModule.io;
} catch (error) {
  console.warn('Could not import io from server module:', error.message);
}

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({});
        res.json(shipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get shipment by ID
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (shipment) {
            res.json(shipment);
        } else {
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create shipment
// @route   POST /api/shipments
// @access  Private
const createShipment = async (req, res) => {
    try {
        const shipment = await Shipment.create(req.body);
        res.status(201).json(shipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update shipment
// @route   PUT /api/shipments/:id
// @access  Private
const updateShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (shipment) {
            // Emit WebSocket event for real-time updates
            if (io) {
                io.emit('shipmentUpdate', {
                    id: shipment._id,
                    status: shipment.status,
                    driverId: shipment.driverId,
                    origin: shipment.origin,
                    destination: shipment.destination,
                    pickupDate: shipment.pickupDate,
                    updatedAt: shipment.updatedAt
                });
            }

            res.json(shipment);
        } else {
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getShipments,
    getShipmentById,
    createShipment,
    updateShipment
};
