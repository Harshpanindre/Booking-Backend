const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Logout
router.post('/logout', authMiddleware, logoutUser);

// Get current logged-in user
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;