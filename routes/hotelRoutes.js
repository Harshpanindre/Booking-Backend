const express = require('express');
const router = express.Router();

const {
  getAllHotels,
  getHotelById,
  searchHotels,
  getHotelsByCity,
  getTopRatedHotels
} = require('../controllers/hotelController');

// Get all hotels
router.get('/', getAllHotels);

// Search hotels
router.get('/search', searchHotels);

// Top rated hotels
router.get('/top-rated', getTopRatedHotels);

// Hotels by city
router.get('/city/:cityName', getHotelsByCity);

// Get single hotel
router.get('/:id', getHotelById);

module.exports = router;