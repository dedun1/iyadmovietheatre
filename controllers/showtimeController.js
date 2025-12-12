// showtimeController.js
// Create, update, delete showtimes + seat map

const db = require("../config/db");

// Helper: add +2 hours for end_time
function addTwoHours(timeStr) {
    let [h, m] = timeStr.split(":");
    let d = new Date();
    d.setHours(Number(h), Number(m), 0);
    d.setHours(d.getHours() + 2);
    return d.toTimeString().split(" ")[0];
}

// Check for overlapping showtimes (same screen + date)
function checkTimeConflict(screen_id, show_date, start_time, end_time, callback) {
    const sql = `
        SELECT *
        FROM showtimes
        WHERE screen_id = ?
        AND show_date = ?
        AND (start_time < ? AND end_time > ?)
    `;

    db.query(sql, [screen_id, show_date, end_time, start_time], (err, rows) => {
        if (err) return callback(err, null);
        callback(null, rows.length > 0 ? rows[0] : null);
    });
}

// Get ALL showtimes
exports.getAllShowtimes = (req, res) => {
    const sql = `
        SELECT s.showtime_id, s.show_date, s.start_time, s.end_time,
               m.title AS movie_title, sc.screen_name
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.movie_id
        JOIN screens sc ON s.screen_id = sc.screen_id
        ORDER BY s.show_date, s.start_time
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

// Get showtime by ID
exports.getShowtimeById = (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM showtimes WHERE showtime_id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (rows.length === 0) return res.status(404).json({ message: "Showtime not found" });

        res.json(rows[0]);
    });
};

// Create showtime
exports.createShowtime = (req, res) => {
    const { movie_id, screen_id, show_date, start_time } = req.body;

    if (!movie_id || !screen_id || !show_date || !start_time)
        return res.status(400).json({ message: "Missing fields" });

    const end_time = addTwoHours(start_time);

    checkTimeConflict(screen_id, show_date, start_time, end_time, (err, conflict) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (conflict)
            return res.status(400).json({ message: "Time overlap found", conflict });

        const sql = `
            INSERT INTO showtimes (movie_id, screen_id, show_date, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [movie_id, screen_id, show_date, start_time, end_time], (err) => {
            if (err) return res.status(500).json({ message: "Database error" });
            res.json({ message: "Showtime created" });
        });
    });
};

// Update showtime
exports.updateShowtime = (req, res) => {
    const id = req.params.id;
    const { movie_id, screen_id, show_date, start_time, end_time } = req.body;

    const sql = `
        UPDATE showtimes SET
            movie_id = COALESCE(?, movie_id),
            screen_id = COALESCE(?, screen_id),
            show_date = COALESCE(?, show_date),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time)
        WHERE showtime_id = ?
    `;

    db.query(sql, [movie_id, screen_id, show_date, start_time, end_time, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Showtime not found" });

        res.json({ message: "Showtime updated" });
    });
};

// Delete showtime
exports.deleteShowtime = (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM showtimes WHERE showtime_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Showtime not found" });

        res.json({ message: "Showtime deleted" });
    });
};

// Seat map (booked + reserved)
exports.getSeatMap = (req, res) => {
    const id = req.params.id;

    const q1 = `
        SELECT sc.seat_rows, sc.seat_columns
        FROM showtimes s
        JOIN screens sc ON s.screen_id = sc.screen_id
        WHERE s.showtime_id = ?
    `;

    db.query(q1, [id], (err, screenRows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (screenRows.length === 0) return res.status(404).json({ message: "Showtime not found" });

        const { seat_rows, seat_columns } = screenRows[0];

        db.query(
            "SELECT seats FROM bookings WHERE showtime_id = ? AND status = 'RESERVED'",
            [id],
            (err, bookedRows) => {
                if (err) return res.status(500).json({ message: "Database error" });

                let booked = [];
                bookedRows.forEach(r => booked.push(...JSON.parse(r.seats)));

                res.json({
                    rows: seat_rows,
                    columns: seat_columns,
                    booked
                });
            }
        );
    });
};

// Check conflict BEFORE creating showtime
exports.checkConflict = (req, res) => {
    const { screen_id, show_date, start_time } = req.body;

    if (!screen_id || !show_date || !start_time)
        return res.status(400).json({ message: "Missing fields" });

    const end_time = addTwoHours(start_time);

    const sql = `
        SELECT *
        FROM showtimes
        WHERE screen_id = ?
        AND show_date = ?
        AND (start_time < ? AND end_time > ?)
    `;

    db.query(sql, [screen_id, show_date, end_time, start_time], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (rows.length > 0) {
            return res.json({
                available: false,
                message: "Conflict found",
                conflict: rows[0]
            });
        }

        res.json({ available: true, message: "No conflict" });
    });
};
