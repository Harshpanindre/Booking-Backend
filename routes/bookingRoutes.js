const express = require('express');
const router = express.Router();
const { 
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    updateStatus
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id', authMiddleware, updateBooking);
router.delete('/:id', authMiddleware, deleteBooking);
router.patch('/:id/status', authMiddleware, updateStatus);

module.exports = router;