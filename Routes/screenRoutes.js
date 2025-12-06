// Handles screens and layout settings
const express = require("express");
const router = express.Router();
const screenController = require("../controllers/screenController");
const { requireAdmin } = require("../middleware/authMiddleware");

// Public
router.get("/", screenController.getAllScreens);
router.get("/:id", screenController.getScreenById);

// Admin
router.post("/", requireAdmin, screenController.createScreen);
router.put("/:id", requireAdmin, screenController.updateScreen);
router.put("/:id/layout", requireAdmin, screenController.updateScreenLayout);
router.put("/:id/price", requireAdmin, screenController.updateScreenPrice);
router.delete("/:id", requireAdmin, screenController.deleteScreen);

module.exports = router;
