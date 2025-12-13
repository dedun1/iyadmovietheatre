// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "iyadkey";

// Helper: get token from Authorization header OR cookies
function getToken(req) {
    // 1-Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        return req.headers.authorization.split(" ")[1];
    }

    // 2️-Cookie token
    if (req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
    }

    return null;
}

// Only logged in users
exports.requireUser = (req, res, next) => {
    const token = getToken(req);

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
    const token = getToken(req);

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

// Guest OR logged-in user
// (used for bookings)
exports.optionalUser = (req, res, next) => {
    const token = getToken(req);

    if (!token) {
        req.user = null; // guest
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null; // treat invalid token as guest
        next();
    }
};
