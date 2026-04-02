const express = require('express');
const router = express.Router();

const {
  getAllFlights,
  getFlightById,
  searchFlights,
  getFlightsByRoute
} = require('../controllers/flightController');

// Get all flights
router.get('/', getAllFlights);

// Search flights
router.get('/search', searchFlights);

// Flights by route
router.get('/route', getFlightsByRoute);

// Get single flight
router.get('/:id', getFlightById);

module.exports = router;