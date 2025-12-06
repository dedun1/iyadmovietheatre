// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "iyadkey";

// Only logged in users
exports.requireUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "You must be logged in." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;   // user_id + role
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

// Only admins
exports.requireAdmin = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Not authorized. No token." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Admins only." });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};
