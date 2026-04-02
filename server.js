require('dotenv').config();
const express = require('express');
const path    = require('path');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Serve the frontend UI from /public
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const hotelRoutes   = require('./routes/hotelRoutes');
const flightRoutes  = require('./routes/flightRoutes');
const paymentRoutes = require('./routes/payementRoutes');
const adminRoutes   = require('./routes/adminRoutes');

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels',   hotelRoutes);
app.use('/api/flights',  flightRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);

// Fallback: serve index.html for any non-API GET request
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && req.method === 'GET') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

// 404 & Error handlers (must be last)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
