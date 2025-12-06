const { body } = require("express-validator");

exports.registerValidator = [
    body("username").notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars")
];

exports.loginValidator = [
    body("username").notEmpty().withMessage("Username required"),
    body("password").notEmpty().withMessage("Password required")
];
