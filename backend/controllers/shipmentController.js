const Shipment = require('../models/Shipment');

// Import io instance for WebSocket events
// Import io instance for WebSocket events - Removed circular dependency
// io is now retrieved from req.app.get('io') in controllers

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
    try {
        console.log(`GET /api/shipments - Fetching shipments for user: ${req.user.name} (${req.user.role})`);

        let query = {};
        if (req.user.role === 'owner') {
            query.ownerId = req.user._id;
        } else if (req.user.role === 'driver') {
            query.driverId = req.user._id;
        }

        const shipments = await Shipment.find(query);
        console.log(`Found ${shipments.length} shipments`);
        res.json(shipments);
    } catch (error) {
        console.error('Error fetching shipments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get shipment by ID
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = async (req, res) => {
    try {
        console.log(`GET /api/shipments/${req.params.id} - Fetching shipment`);
        const shipment = await Shipment.findById(req.params.id);

        if (shipment) {
            res.json(shipment);
        } else {
            console.log(`Shipment ${req.params.id} not found`);
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        console.error(`Error fetching shipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create shipment
// @route   POST /api/shipments
// @access  Private
const createShipment = async (req, res) => {
    try {
        console.log('POST /api/shipments - Creating new shipment:', req.body.trackingId);
        const shipment = await Shipment.create(req.body);
        console.log('Shipment created successfully:', shipment._id);
        res.status(201).json(shipment);
    } catch (error) {
        console.error('Error creating shipment:', error);
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
            // Emit WebSocket event for real-time updates
            const io = req.app.get('io');
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

// @desc    Get shipment by Tracking ID (Public)
// @route   GET /api/shipments/lookup/:trackingId
// @access  Public
const getShipmentByTracking = async (req, res) => {
    try {
        console.log(`GET /api/shipments/lookup/${req.params.trackingId} - Public tracking request`);
        const { trackingId } = req.params;

        // Case-insensitive search
        const shipment = await Shipment.findOne({
            trackingId: { $regex: new RegExp(`^${trackingId}$`, 'i') }
        }).select('-ownerId -driverId -pickupContactPerson -pickupContactPhone -deliveryContactPerson -deliveryContactPhone'); // Exclude sensitive info for public view

        if (shipment) {
            res.json(shipment);
        } else {
            console.log(`Shipment with tracking ID ${trackingId} not found`);
            res.status(404).json({ message: 'Shipment not found' });
        }
    } catch (error) {
        console.error(`Error tracking shipment ${req.params.trackingId}:`, error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getShipments,
    getShipmentById,
    createShipment,
    updateShipment,
    getShipmentByTracking
};
