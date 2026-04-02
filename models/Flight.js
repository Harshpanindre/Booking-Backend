const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: [true, 'Airline name is required'],
    trim: true
  },
  flightNumber: {
    type: String,
    required: [true, 'Flight number is required'],
    unique: true,
    uppercase: true
  },
  origin: {
    type: String,
    required: [true, 'Origin city is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination city is required'],
    trim: true
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    default: 180
  },
  availableSeats: {
    type: Number,
    default: 180
  },
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    default: 'economy'
  }
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
