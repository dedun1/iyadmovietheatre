// controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = "iyadkey";

// Save authentication logs to SQLite database
function logAuthEvent(username, success, ip) {
    const sql = `
        INSERT INTO auth_logs (username, success, ip_address)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [username, success ? 1 : 0, ip], (err) => {
        if (err) {
            console.error("AUTH LOG ERROR:", err);
        }
    });
}

// REGISTER USER
exports.register = (req, res) => {
    let { username, email, password } = req.body;

    // Manual validation (no external packages)
    username = (username || "").trim().toLowerCase();
    email = (email || "").trim().toLowerCase();
    password = (password || "").trim();

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const sql = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, 'user')
    `;

    db.query(sql, [username, email, passwordHash], (err) => {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                return res.status(400).json({ message: "Email or username already exists" });
            }
            return res.status(500).json({ message: "Registration failed" });
        }

        res.json({ message: "User registered successfully" });
    });
};

// LOGIN USER

exports.login = (req, res) => {
    let { username, password } = req.body;

    // Manual validation
    username = (username || "").trim().toLowerCase();
    password = (password || "").trim();

    if (!username || !password) {
        logAuthEvent(username, false, req.ip);
        return res.status(400).json({ message: "Username and password are required" });
    }

    const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";

    db.query(sql, [username], (err, users) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (!users || users.length === 0) {
            logAuthEvent(username, false, req.ip);
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const user = users[0];
        const isMatch = bcrypt.compareSync(password, user.password_hash);

        if (!isMatch) {
            logAuthEvent(username, false, req.ip);
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Create JWT token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Store JWT securely in cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: false
        });

        // Log success
        logAuthEvent(username, true, req.ip);

        res.json({ message: "Login successful", token });
    });
};

// LOGOUT USER

exports.logout = (req, res) => {
    res.clearCookie("jwt");
    res.json({ message: "Logged out" });
};
