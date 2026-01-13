const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'ZMW'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    payer: {
        type: String,
        required: true
    },
    payee: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['driver_payment', 'client_invoice'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
