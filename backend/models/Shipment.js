const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    pickupContactPerson: String,
    pickupContactPhone: String,
    deliveryContactPerson: String,
    deliveryContactPhone: String,
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
        default: 'pending'
    },
    cargoType: {
        type: String,
        required: true
    },
    weight: String,
    quantity: Number,
    description: String,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    specialInstructions: String,
    incidentNote: String,
    pickupDate: {
        type: Date,
        required: true
    },
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Shipment', shipmentSchema);
