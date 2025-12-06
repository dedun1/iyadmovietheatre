// userModel.js
// Talks directly to the users table in MySQL

const db = require("../config/db");

// Insert new user
exports.createUser = (username, email, passwordHash, callback) => {
    const sql = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    `;
    db.query(sql, [username, email, passwordHash], callback);
};

// Find user by email
exports.findByEmail = (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
    db.query(sql, [email], callback);
};
