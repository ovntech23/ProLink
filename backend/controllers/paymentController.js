const Payment = require('../models/Payment');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find({});
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);

        if (payment) {
            res.json(payment);
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private
const updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (payment) {
            res.json(payment);
        } else {
            res.status(404).json({ message: 'Payment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
    try {
        const {
            shipmentId,
            amount,
            currency,
            status,
            payer,
            payee,
            type
        } = req.body;

        const payment = new Payment({
            shipmentId: (shipmentId && shipmentId !== 'N/A') ? shipmentId : undefined,
            amount,
            currency,
            status: status || 'pending',
            payer,
            payee,
            type
        });

        const createdPayment = await payment.save();

        // Get socket.io instance
        const io = req.app.get('io');

        // Broadcast to all clients
        io.emit('paymentCreated', createdPayment);

        // Emit generic update
        io.emit('data-updated', {
            type: 'payment',
            action: 'create',
            data: createdPayment
        });

        res.status(201).json(createdPayment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ message: 'Server error creating payment' });
    }
};

module.exports = {
    getPayments,
    getPaymentById,
    updatePaymentStatus,
    createPayment
};
