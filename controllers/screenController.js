// screenController.js
// Handles creating, editing, and viewing cinema screens

const db = require("../config/db");

// GET all screens
exports.getAllScreens = (req, res) => {
    const query = `
        SELECT screen_id, screen_name, seat_rows, seat_columns,
        total_seats, screen_type, base_price, vip_rows, blocked_seats
        FROM screens
        ORDER BY screen_id ASC
    `;

    db.query(query, (err, screens) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(screens);
    });
};

// GET screen by ID
exports.getScreenById = (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT screen_id, screen_name, seat_rows, seat_columns,
        vip_rows, blocked_seats, screen_type, base_price, total_seats
        FROM screens
        WHERE screen_id = ?
    `;

    db.query(query, [id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (rows.length === 0) return res.status(404).json({ message: "Screen not found" });

        res.json(rows[0]);
    });
};

// CREATE screen
exports.createScreen = (req, res) => {
    const { screen_name, seat_rows, seat_columns, screen_type, base_price, vip_rows, blocked_seats } = req.body;

    if (!screen_name || !seat_rows || !seat_columns) {
        return res.status(400).json({ message: "screen_name, seat_rows, seat_columns are required." });
    }

    const total_seats = seat_rows * seat_columns;

    const query = `
        INSERT INTO screens
        (screen_name, seat_rows, seat_columns, total_seats, screen_type, base_price, vip_rows, blocked_seats)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        screen_name,
        seat_rows,
        seat_columns,
        total_seats,
        screen_type || "STANDARD",
        base_price || 150,
        vip_rows || null,
        blocked_seats || null
    ], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        res.json({ message: "Screen created", screen_id: result.insertId });
    });
};

// UPDATE entire screen
exports.updateScreen = (req, res) => {
    const id = req.params.id;

    const { screen_name, seat_rows, seat_columns, screen_type, base_price, vip_rows, blocked_seats } = req.body;

    let total_seats = null;
    if (seat_rows && seat_columns) {
        total_seats = seat_rows * seat_columns;
    }

    const query = `
        UPDATE screens SET
            screen_name = COALESCE(?, screen_name),
            seat_rows = COALESCE(?, seat_rows),
            seat_columns = COALESCE(?, seat_columns),
            total_seats = COALESCE(?, total_seats),
            screen_type = COALESCE(?, screen_type),
            base_price = COALESCE(?, base_price),
            vip_rows = COALESCE(?, vip_rows),
            blocked_seats = COALESCE(?, blocked_seats)
        WHERE screen_id = ?
    `;

    db.query(query, [
        screen_name,
        seat_rows,
        seat_columns,
        total_seats,
        screen_type,
        base_price,
        vip_rows,
        blocked_seats,
        id
    ], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Screen not found" });

        res.json({ message: "Screen updated" });
    });
};

// UPDATE only layout (rows/columns)
exports.updateScreenLayout = (req, res) => {
    const id = req.params.id;
    const { seat_rows, seat_columns } = req.body;

    if (!seat_rows || !seat_columns) {
        return res.status(400).json({ message: "seat_rows and seat_columns required" });
    }

    const total_seats = seat_rows * seat_columns;

    const query = `
        UPDATE screens SET
            seat_rows = ?, seat_columns = ?, total_seats = ?
        WHERE screen_id = ?
    `;

    db.query(query, [seat_rows, seat_columns, total_seats, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Screen not found" });

        res.json({ message: "Layout updated" });
    });
};

// UPDATE only price
exports.updateScreenPrice = (req, res) => {
    const id = req.params.id;
    const { base_price } = req.body;

    if (!base_price) {
        return res.status(400).json({ message: "base_price required" });
    }

    db.query("UPDATE screens SET base_price = ? WHERE screen_id = ?", [base_price, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Screen not found" });

        res.json({ message: "Price updated" });
    });
};

// DELETE screen
exports.deleteScreen = (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM screens WHERE screen_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Screen not found" });

        res.json({ message: "Screen deleted" });
    });
};
