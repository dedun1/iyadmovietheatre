// movieController.js
// Handles adding, editing, deleting, and listing movies

const db = require("../config/db");

// GET all movies
exports.getAllMovies = (req, res) => {
    const query = "SELECT * FROM movies ORDER BY movie_id DESC";

    db.query(query, (err, movies) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(movies);
    });
};

// GET movie by ID
exports.getMovieById = (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM movies WHERE movie_id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (rows.length === 0) return res.status(404).json({ message: "Movie not found" });

        res.json(rows[0]);
    });
};

// ADD movie (Admin)
exports.addMovie = (req, res) => {
    const { title, description, duration, rating, release_date } = req.body;

    if (!title || !description || !duration) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `
        INSERT INTO movies (title, description, duration, rating, release_date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [title, description, duration, rating || null, release_date || null], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to add movie" });

        res.json({ message: "Movie added", movie_id: result.insertId });
    });
};

// UPDATE movie
exports.updateMovie = (req, res) => {
    const id = req.params.id;
    const { title, description, duration, rating, release_date } = req.body;

    const query = `
        UPDATE movies SET
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            duration = COALESCE(?, duration),
            rating = COALESCE(?, rating),
            release_date = COALESCE(?, release_date)
        WHERE movie_id = ?
    `;

    db.query(query, [title, description, duration, rating, release_date, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update movie" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Movie not found" });

        res.json({ message: "Movie updated" });
    });
};

// DELETE movie
exports.deleteMovie = (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM movies WHERE movie_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to delete movie" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Movie not found" });

        res.json({ message: "Movie deleted" });
    });
};

// UPLOAD poster
exports.uploadPoster = (req, res) => {
    const id = req.params.id;

    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const posterUrl = `/uploads/posters/${req.file.filename}`;

    db.query("UPDATE movies SET poster_url = ? WHERE movie_id = ?", [posterUrl, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to update poster" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Movie not found" });

        res.json({ message: "Poster updated", poster_url: posterUrl });
    });
};
