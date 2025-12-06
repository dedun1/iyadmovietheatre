// Handles showtimes and seat maps
const express = require("express");
const router = express.Router();

const showtimeController = require("../controllers/showtimeController");
const { requireAdmin } = require("../middleware/authMiddleware");

// Public
router.get("/", showtimeController.getAllShowtimes);
router.get("/:id", showtimeController.getShowtimeById);
router.get("/:id/seats", showtimeController.getSeatMap);

// Admin
router.post("/", requireAdmin, showtimeController.createShowtime);
router.put("/:id", requireAdmin, showtimeController.updateShowtime);
router.delete("/:id", requireAdmin, showtimeController.deleteShowtime);

// Check schedule conflict
router.post("/check-conflict", requireAdmin, showtimeController.checkConflict);

module.exports = router;
