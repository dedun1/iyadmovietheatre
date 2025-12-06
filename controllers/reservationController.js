// reservationController.js
// Handles temporary 10-minute seat reservations

const db = require("../config/db");

// INTERNAL: Delete expired temporary reservations
function cleanupExpired(callback) {
    const sql = `
        DELETE FROM seat_reservations
        WHERE expires_at < DATETIME('now')
    `;

    db.query(sql, (err) => {
        // Even if cleanup fails, continue
        callback();
    });
}

// Reserve seats for 10 minutes
exports.reserveSeats = (req, res) => {
    const { showtimeId, seats, sessionId } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0 || !sessionId) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    cleanupExpired(() => {
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // +10 min

        const sql = `
            INSERT INTO seat_reservations (showtime_id, seat_number, session_id, expires_at)
            VALUES (?, ?, ?, ?)
        `;

        let errors = [];

        // Insert each seat one by one 
        seats.forEach(seat => {
            db.query(sql, [showtimeId, seat, sessionId, expiresAt], (err) => {
                if (err) errors.push(seat);
            });
        });

        if (errors.length > 0) {
            return res.status(409).json({
                message: "Some seats are already reserved",
                seats: errors
            });
        }

        return res.json({
            message: "Seats reserved for 10 minutes",
            expires_at: expiresAt
        });
    });
};

// Admin endpoint: Cleanup all expired seat reservations
exports.cleanupExpiredReservations = (req, res) => {
    const sql = `
        DELETE FROM seat_reservations
        WHERE expires_at < DATETIME('now')
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        return res.json({
            message: "Expired reservations removed",
            deleted: result?.affectedRows || 0
        });
    });
};
