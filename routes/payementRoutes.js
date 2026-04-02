const express = require('express');
const router = express.Router();

const {
  createCheckout,
  verifyPayment,
  getPaymentDetails
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');

// Create payment
router.post('/checkout', authMiddleware, createCheckout);

// Verify payment
router.post('/verify', authMiddleware, verifyPayment);

// Get payment details by booking
router.get('/:bookingId', authMiddleware, getPaymentDetails);

module.exports = router;