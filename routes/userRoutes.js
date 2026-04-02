const express = require('express');
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserBookings,
  changePassword
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');


// Get logged-in user's profile
router.get('/profile', authMiddleware, getUserProfile);

// Update profile
router.put('/profile', authMiddleware, updateUserProfile);

// Delete account
router.delete('/account', authMiddleware, deleteUserAccount);

// Get all bookings of logged-in user
router.get('/bookings', authMiddleware, getUserBookings);

// Change password
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;