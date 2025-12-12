// Admin dashboards + booking tools
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", requireAdmin, adminController.getDashboard);

// Filter bookings
router.get("/bookings", requireAdmin, adminController.getAdminBookings);

// Update booking status
router.put("/bookings/:id/status", requireAdmin, adminController.updateBookingStatus);

module.exports = router;
