const Hotel = require('../models/Hotel');

// GET /api/hotels
// Get all hotels
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ rating: -1 });
    res.json({ success: true, count: hotels.length, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/hotels/:id
// Get single hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/hotels/search?city=Mumbai&minPrice=500&maxPrice=5000&minRating=4
// Search hotels by city, price range, and rating
exports.searchHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, minRating, name } = req.query;

    const query = {};
    if (city) query.city = { $regex: city, $options: 'i' };
    if (name) query.name = { $regex: name, $options: 'i' };
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }
    if (minRating) query.rating = { $gte: Number(minRating) };

    const hotels = await Hotel.find(query).sort({ rating: -1 });
    res.json({ success: true, count: hotels.length, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/hotels/city/:cityName
// Get all hotels in a specific city
exports.getHotelsByCity = async (req, res) => {
  try {
    const { cityName } = req.params;

    const hotels = await Hotel.find({
      city: { $regex: cityName, $options: 'i' }
    }).sort({ rating: -1 });

    res.json({ success: true, count: hotels.length, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/hotels/top-rated
// Get top-rated hotels (rating >= 4, sorted desc)
exports.getTopRatedHotels = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const hotels = await Hotel.find({ rating: { $gte: 4 } })
      .sort({ rating: -1 })
      .limit(limit);

    res.json({ success: true, count: hotels.length, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
