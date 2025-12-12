// bookingController.js
// Handles booking creation, listing, and cancelling for users and guests

const db = require("../config/db");

// INTERNAL: Validate seats belong to screen layout
function validateSeats(seats, seat_rows, seat_columns) {
    for (let seat of seats) {
        const rowLetter = seat[0].toUpperCase();
        const colNum = parseInt(seat.slice(1));

        const rowIndex = rowLetter.charCodeAt(0) - 64; // A=1

        if (rowIndex < 1 || rowIndex > seat_rows) {
            return `Invalid row: ${seat}`;
        }
        if (colNum < 1 || colNum > seat_columns) {
            return `Invalid column: ${seat}`;
        }
    }
    return null;
}

// INTERNAL: Check if seats already booked
function checkSeatConflicts(showtime_id, seats, callback) {
    const sql = `
        SELECT seats FROM bookings
        WHERE showtime_id = ? AND status = 'RESERVED'
    `;

    db.query(sql, [showtime_id], (err, rows) => {
        if (err) return callback(err);

        let taken = new Set();
        rows.forEach(r => {
            JSON.parse(r.seats).forEach(s => taken.add(s));
        });

        const conflict = seats.filter(s => taken.has(s));

        callback(null, conflict);
    });
}

// INTERNAL: Insert booking in DB
function insertBooking(showtime_id, user_id, guest, seats, total, res) {
    const sql = `
        INSERT INTO bookings
        (showtime_id, user_id, guest_name, guest_email, guest_phone, seats, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'RESERVED')
    `;

    db.query(
        sql,
        [
            showtime_id,
            user_id,
            guest?.name || null,
            guest?.email || null,
            guest?.phone || null,
            JSON.stringify(seats),
            total
        ],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Booking insert error" });

            res.json({
                message: user_id ? "Booking created" : "Guest booking created",
                booking_id: result.insertId
            });
        }
    );
}

// CREATE BOOKING — GUEST OR USER
exports.createBooking = (req, res) => {
    const { showtime_id, seats, guest_name, guest_email, guest_phone } = req.body;
    const user_id = req.user ? req.user.user_id : null;

    if (!showtime_id || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Guest booking must include fields
    if (!user_id && (!guest_name || !guest_email || !guest_phone)) {
        return res.status(400).json({ message: "Guest must provide name, email, phone" });
    }

    const sql = `
        SELECT s.*, sc.seat_rows, sc.seat_columns, sc.base_price 
        FROM showtimes s
        JOIN screens sc ON s.screen_id = sc.screen_id
        WHERE s.showtime_id = ?
    `;

    db.query(sql, [showtime_id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (rows.length === 0) return res.status(404).json({ message: "Showtime not found" });

        const st = rows[0];

        // Validate seat format
        const seatError = validateSeats(seats, st.seat_rows, st.seat_columns);
        if (seatError) return res.status(400).json({ message: seatError });

        // Check conflicting seats
        checkSeatConflicts(showtime_id, seats, (err, conflict) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (conflict.length > 0) {
                return res.status(400).json({
                    message: "Some seats are already booked",
                    conflict
                });
            }

            // Price calculation
            const total_price = st.base_price * seats.length;

            // Insert booking
            insertBooking(
                showtime_id,
                user_id,
                {
                    name: guest_name,
                    email: guest_email,
                    phone: guest_phone
                },
                seats,
                total_price,
                res
            );
        });
    });
};

// USER: View their own bookings
exports.getMyBookings = (req, res) => {
    const user_id = req.user.user_id;

    const sql = `
        SELECT b.*, s.show_date, s.start_time, m.title AS movie_title
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        WHERE b.user_id = ?
        ORDER BY b.booking_time DESC
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

//ADMIN: View ALL bookings
exports.getAllBookings = (req, res) => {
    const sql = `
        SELECT b.*, u.username, s.show_date, s.start_time, m.title AS movie_title
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.user_id
        JOIN showtimes s ON b.showtime_id = s.showtime_id
        JOIN movies m ON s.movie_id = m.movie_id
        ORDER BY b.booking_time DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

//USER: Cancel their own booking
exports.cancelBooking = (req, res) => {
    const user_id = req.user.user_id;
    const booking_id = req.params.id;

    const sql = `
        UPDATE bookings
        SET status = 'CANCELLED'
        WHERE booking_id = ? AND user_id = ?
    `;

    db.query(sql, [booking_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Not found or not owned by user" });
        }

        res.json({ message: "Booking cancelled" });
    });
};
