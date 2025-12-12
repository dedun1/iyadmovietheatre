const express = require("express");
const router = express.Router();
const { requireUser } = require("../middleware/authMiddleware");

const bookingController = require("../controllers/bookingController");

// Guest booking or user booking
router.post("/", bookingController.createBooking);

// User tools
router.get("/my", requireUser, bookingController.getMyBookings);
router.delete("/:id", requireUser, bookingController.cancelBooking);

// Admin view all bookings
router.get("/", bookingController.getAllBookings);


module.exports = router;
