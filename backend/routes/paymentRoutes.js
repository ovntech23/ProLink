const express = require('express');
const router = express.Router();
const { getPayments, getPaymentById, updatePaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Get all payments
router.get('/', protect, getPayments);

// Get payment by ID
router.get('/:id', protect, getPaymentById);

// Update payment status
router.put('/:id', protect, updatePaymentStatus);

module.exports = router;
