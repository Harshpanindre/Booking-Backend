const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  amenities: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  availableRooms: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
