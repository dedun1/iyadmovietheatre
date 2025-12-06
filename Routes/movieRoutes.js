// Handles movies + poster upload
const express = require("express");
const router = express.Router();

const movieController = require("../controllers/movieController");
const uploadPoster = require("../middleware/uploadPoster");
const { requireAdmin } = require("../middleware/authMiddleware");

// Public
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMovieById);

// Admin only
router.post("/", requireAdmin, movieController.addMovie);
router.put("/:id", requireAdmin, movieController.updateMovie);
router.delete("/:id", requireAdmin, movieController.deleteMovie);

// Upload poster
router.post(
  "/:id/poster",
  requireAdmin,
  uploadPoster.single("poster"),
  movieController.uploadPoster
);

module.exports = router;
