// uploadPoster.js
// Handles movie poster uploads using multer

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folder exists
const folder = path.join(__dirname, "..", "uploads", "posters");
if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
}

// Storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, folder),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `poster_${Date.now()}${ext}`);
    }
});

// Only allow images
const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
};

module.exports = multer({ storage, fileFilter });
