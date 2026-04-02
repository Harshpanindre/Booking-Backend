const User = require('../models/User');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// GET /api/admin/users
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
// Delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Also delete their bookings
    await Booking.deleteMany({ user: req.params.id });

    res.json({ success: true, message: 'User and their bookings deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/bookings
// Get all bookings across all users
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('flight', 'airline flightNumber origin destination departureTime price')
      .populate('hotel', 'name city pricePerNight rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/hotels
// Add a new hotel
exports.addHotel = async (req, res) => {
  try {
    const { name, city, address, description, pricePerNight, rating, amenities, images, availableRooms } = req.body;

    if (!name || !city || !pricePerNight) {
      return res.status(400).json({ message: 'Name, city, and pricePerNight are required' });
    }

    const hotel = await Hotel.create({
      name,
      city,
      address,
      description,
      pricePerNight,
      rating: rating || 0,
      amenities: amenities || [],
      images: images || [],
      availableRooms: availableRooms || 0
    });

    res.status(201).json({ success: true, message: 'Hotel added successfully', hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/hotels/:id
// Update a hotel's details
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.json({ success: true, message: 'Hotel updated successfully', hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/hotels/:id
// Delete a hotel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
