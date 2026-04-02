const Flight = require('../models/Flight');

// GET /api/flights
// Get all flights
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureTime: 1 });
    res.json({ success: true, count: flights.length, flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/flights/:id
// Get single flight by ID
exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json({ success: true, flight });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/flights/search?origin=Mumbai&destination=Delhi&date=2025-12-01&passengers=2
// Search flights by origin, destination, date, and optional passengers
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, date, passengers, class: flightClass } = req.query;

    const query = {};
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (flightClass) query.class = flightClass;
    if (passengers) query.availableSeats = { $gte: Number(passengers) };

    // Filter by date (match same calendar day)
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.departureTime = { $gte: start, $lt: end };
    }

    const flights = await Flight.find(query).sort({ price: 1 });
    res.json({ success: true, count: flights.length, flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/flights/route?origin=Mumbai&destination=Delhi
// Get flights by route (origin → destination)
exports.getFlightsByRoute = async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Both origin and destination are required' });
    }

    const flights = await Flight.find({
      origin: { $regex: origin, $options: 'i' },
      destination: { $regex: destination, $options: 'i' }
    }).sort({ departureTime: 1 });

    res.json({ success: true, count: flights.length, flights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
