const express = require('express');
const router = express.Router();
const { getShipments, getShipmentById, createShipment, updateShipment } = require('../controllers/shipmentController');
const { protect } = require('../middleware/auth');

// Get all shipments
router.get('/', protect, getShipments);

// Get shipment by ID
router.get('/:id', protect, getShipmentById);

// Create shipment
router.post('/', protect, createShipment);

// Update shipment
router.put('/:id', protect, updateShipment);

module.exports = router;
