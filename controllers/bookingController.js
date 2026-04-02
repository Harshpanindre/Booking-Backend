const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Hotel = require('../models/Hotel');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { bookingType, flightId, hotelId, checkIn, checkOut, passengers } = req.body;

    let totalAmount = 0;
    let bookingData = {
      user: req.user.userId,
      bookingType,
      passengers: passengers || 1
    };

    if (bookingType === 'flight') {
      if (!flightId) return res.status(400).json({ message: 'Flight ID is required' });

      const flight = await Flight.findById(flightId);
      if (!flight) return res.status(404).json({ message: 'Flight not found' });
      if (flight.availableSeats < (passengers || 1))
        return res.status(400).json({ message: 'Not enough seats available' });

      totalAmount = flight.price * (passengers || 1);
      bookingData.flight = flightId;

      flight.availableSeats -= (passengers || 1);
      await flight.save();

    } else if (bookingType === 'hotel') {
      if (!hotelId || !checkIn || !checkOut)
        return res.status(400).json({ message: 'Hotel ID, check-in and check-out dates are required' });

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
      if (hotel.availableRooms < 1)
        return res.status(400).json({ message: 'No rooms available' });

      const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
      if (nights <= 0) return res.status(400).json({ message: 'Invalid check-in/check-out dates' });

      totalAmount = hotel.pricePerNight * nights;
      bookingData.hotel = hotelId;
      bookingData.checkIn = checkIn;
      bookingData.checkOut = checkOut;

      hotel.availableRooms -= 1;
      await hotel.save();

    } else {
      return res.status(400).json({ message: 'bookingType must be "flight" or "hotel"' });
    }

    bookingData.totalAmount = totalAmount;
    const booking = await Booking.create(bookingData);

    res.status(201).json({ success: true, message: 'Booking created successfully', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate('flight', 'airline flightNumber origin destination departureTime price')
      .populate('hotel', 'name city pricePerNight rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('flight')
      .populate('hotel')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user._id.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Cannot update a cancelled booking' });

    const { checkIn, checkOut, passengers } = req.body;
    if (checkIn) booking.checkIn = checkIn;
    if (checkOut) booking.checkOut = checkOut;
    if (passengers) booking.passengers = passengers;

    await booking.save();
    res.json({ success: true, message: 'Booking updated', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user.userId.toString())
      return res.status(403).json({ message: 'Access denied' });

    if (booking.bookingType === 'flight' && booking.flight)
      await Flight.findByIdAndUpdate(booking.flight, { $inc: { availableSeats: booking.passengers } });

    if (booking.bookingType === 'hotel' && booking.hotel)
      await Hotel.findByIdAndUpdate(booking.hotel, { $inc: { availableRooms: 1 } });

    await booking.deleteOne();
    res.json({ success: true, message: 'Booking cancelled and deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/status (admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled'];

    if (!allowed.includes(status))
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ success: true, message: `Booking status updated to "${status}"`, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
