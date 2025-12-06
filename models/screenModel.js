// screenModel.js
// Basic model for reading screen info

const db = require("../config/db");

// Get all screens
exports.getAllScreens = (callback) => {
    const sql = `
        SELECT screen_id, screen_name, total_seats, screen_type,
               base_price, seat_rows, seat_columns, vip_rows, blocked_seats
        FROM screens
    `;
    db.query(sql, callback);
};

// Get one screen
exports.getScreenById = (screenId, callback) => {
    const sql = `
        SELECT screen_id, screen_name, seat_rows, seat_columns,
               vip_rows, blocked_seats, screen_type, base_price, total_seats
        FROM screens
        WHERE screen_id = ?
    `;
    db.query(sql, [screenId], (err, rows) => {
        callback(err, rows[0]);
    });
};
