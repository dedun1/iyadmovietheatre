// app.js
// Main Express setup file

const express = require('express');
const app = express();

const db = require('./config/db');
const cors = require("cors");
const cookieParser = require("cookie-parser");

app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5500"],
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());   

// Routes
app.use('/auth', require('./Routes/authRoutes'));
app.use('/movies', require('./Routes/movieRoutes'));
app.use('/screens', require('./Routes/screenRoutes'));
app.use('/showtimes', require('./Routes/showtimeRoutes'));
app.use('/bookings', require('./Routes/bookingRoutes'));
app.use('/admin', require('./Routes/adminRoutes'));
app.use("/uploads", express.static("uploads"));

// Home
app.get('/', (req, res) => {
  res.send('Iyad Movie Theatre Backend Running');
});

module.exports = app;