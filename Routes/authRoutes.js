// Handles user sign-up, login, logout
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../middleware/validators");


router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.post("/logout", authController.logout);

module.exports = router;
