const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  deleteUser,
  getAllBookings,
  addHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all admin routes
router.use(authMiddleware, adminMiddleware);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Bookings
router.get('/bookings', getAllBookings);

// Hotels management
router.post('/hotels', addHotel);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);

module.exports = router;