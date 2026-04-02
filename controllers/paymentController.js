const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// POST /api/payments/checkout
exports.createCheckout = async (req, res) => {
  try {
    const { bookingId, method } = req.body;

    if (!bookingId)
      return res.status(400).json({ message: 'Booking ID is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Booking is already paid' });

    // Simulate payment processing (replace with Razorpay / Stripe later)
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const payment = await Payment.create({
      booking: bookingId,
      user:    req.user.userId,
      amount:  booking.totalAmount,
      method:  method || 'card',
      status:  'success',
      transactionId
    });

    // Mark booking as paid and confirmed
    booking.paymentStatus = 'paid';
    booking.status        = 'confirmed';
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Payment successful',
      transactionId,
      payment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId)
      return res.status(400).json({ message: 'Transaction ID is required' });

    const payment = await Payment.findOne({ transactionId })
      .populate('booking', 'bookingType status totalAmount')
      .populate('user', 'name email');

    if (!payment)
      return res.status(404).json({ message: 'Payment not found' });

    if (payment.user._id.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    res.json({ success: true, verified: payment.status === 'success', payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/:bookingId
exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('booking')
      .populate('user', 'name email');

    if (!payment)
      return res.status(404).json({ message: 'Payment record not found for this booking' });

    if (payment.user._id.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
