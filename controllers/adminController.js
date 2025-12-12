// adminController.js
// Admin tools: dashboard numbers, booking filters, update status, cleanup

const db = require("../config/db");

// DASHBOARD SUMMARY NUMBERS
exports.getDashboard = (req, res) => {
    const q1 = "SELECT COUNT(*) AS total_movies FROM movies";
    const q2 = "SELECT COUNT(*) AS total_screens FROM screens";
    const q3 = "SELECT COUNT(*) AS total_showtimes FROM showtimes";
    const q4 = "SELECT COUNT(*) AS bookings_today FROM bookings WHERE DATE(booking_time) = DATE('now')";
    const q5 = "SELECT COUNT(*) AS upcoming_showtimes FROM showtimes WHERE show_date >= DATE('now')";

    let summary = {};

    db.query(q1, (err, m) => {
        if (err) return res.status(500).json({ message: "Database error" });
        summary.total_movies = m[0].total_movies;

        db.query(q2, (err, s) => {
            if (err) return res.status(500).json({ message: "Database error" });
            summary.total_screens = s[0].total_screens;

            db.query(q3, (err, st) => {
                if (err) return res.status(500).json({ message: "Database error" });
                summary.total_showtimes = st[0].total_showtimes;

                db.query(q4, (err, b) => {
                    if (err) return res.status(500).json({ message: "Database error" });
                    summary.bookings_today = b[0].bookings_today;

                    db.query(q5, (err, u) => {
                        if (err) return res.status(500).json({ message: "Database error" });

                        summary.upcoming_showtimes = u[0].upcoming_showtimes;

                        res.json(summary);
                    });
                });
            });
        });
    });
};

// ADMIN FILTER BOOKINGS
exports.getAdminBookings = (req, res) => {
    const { date, status, movieId, page = 1, limit = 20 } = req.query;

    let sql = `
        SELECT b.*, m.title AS movie_title, s.show_date, s.start_time
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE 1=1
    `;

    let params = [];

    if (date) {
        sql += " AND DATE(b.booking_time) = ?";
        params.push(date);
    }

    if (status) {
        sql += " AND b.status = ?";
        params.push(status);
    }

    if (movieId) {
        sql += " AND m.movie_id = ?";
        params.push(movieId);
    }

    sql += " ORDER BY b.booking_time DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), (page - 1) * limit);

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

// UPDATE BOOKING STATUS (Admin)
exports.updateBookingStatus = (req, res) => {
    const bookingId = req.params.id;
    const { status, notes } = req.body;

    if (!status) return res.status(400).json({ message: "Status required" });

    const sql = `
        UPDATE bookings
        SET status = ?, admin_notes = ?
        WHERE booking_id = ?
    `;

    db.query(sql, [status, notes || null, bookingId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ message: "Booking status updated" });
    });
};

