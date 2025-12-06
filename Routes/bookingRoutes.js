const express = require("express");
const router = express.Router();
const { requireUser } = require("../middleware/authMiddleware");

const bookingController = require("../controllers/bookingController");
const reservationController = require("../controllers/reservationController");

// Reserve seats for 10 minutes
router.post("/reserve-seats", reservationController.reserveSeats);

// Guest booking or user booking
router.post("/", bookingController.createBooking);

// User tools
router.get("/my", requireUser, bookingController.getMyBookings);
router.delete("/:id", requireUser, bookingController.cancelBooking);

// Admin view all bookings
router.get("/", bookingController.getAllBookings);

// Admin cleanup expired reservations (THIS FIXES YOUR 404)
router.post("/admin/cleanup-expired", reservationController.cleanupExpiredReservations);

module.exports = router;
