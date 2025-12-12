// config/db.js
// SQLite database connection + table creation

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Database file will be created in the backend folder
const dbPath = path.join(__dirname, "..", "iyad_cinema.db");

// Open or create the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err);
  } else {
    console.log("SQLite database connected:", dbPath);
  }
});

// Small helper so we can still call db.query(sql, params, callback)
 
db.query = (sql, params, callback) => {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  const isSelect = /^\s*select/i.test(sql);

  if (isSelect) {
    db.all(sql, params, (err, rows) => {
      callback(err, rows);
    });
  } else {
    db.run(sql, params, function (err) {
      if (err) return callback(err);

      // Mimic mysql2 result object
      callback(null, {
        affectedRows: this.changes,
        insertId: this.lastID,
      });
    });
  }
};


// Create tables if they do not exist.
// This runs once when the app starts.
 
const initSchema = () => {
  db.serialize(() => {
    // USERS
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL UNIQUE,
        email         TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'user',
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // MOVIES
    db.run(`
      CREATE TABLE IF NOT EXISTS movies (
        movie_id    INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT NOT NULL,
        description TEXT,
        duration    INTEGER,
        rating      TEXT,
        release_date TEXT,
        poster_url  TEXT,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // SCREENS
    db.run(`
      CREATE TABLE IF NOT EXISTS screens (
        screen_id    INTEGER PRIMARY KEY AUTOINCREMENT,
        screen_name  TEXT NOT NULL,
        seat_rows    INTEGER NOT NULL,
        seat_columns INTEGER NOT NULL,
        total_seats  INTEGER NOT NULL,
        screen_type  TEXT DEFAULT 'STANDARD',
        base_price   REAL DEFAULT 150,
        vip_rows     TEXT,
        blocked_seats TEXT
      )
    `);

    // SHOWTIMES
    db.run(`
      CREATE TABLE IF NOT EXISTS showtimes (
        showtime_id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id    INTEGER NOT NULL,
        screen_id   INTEGER NOT NULL,
        show_date   TEXT NOT NULL,          -- YYYY-MM-DD
        start_time  TEXT NOT NULL,          -- HH:MM:SS
        end_time    TEXT NOT NULL,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
        FOREIGN KEY (screen_id) REFERENCES screens(screen_id)
      )
    `);

    // BOOKINGS
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id   INTEGER PRIMARY KEY AUTOINCREMENT,
        showtime_id  INTEGER NOT NULL,
        user_id      INTEGER,
        guest_name   TEXT,
        guest_email  TEXT,
        guest_phone  TEXT,
        seats        TEXT NOT NULL,         -- JSON string
        total_price  REAL NOT NULL,
        status       TEXT NOT NULL DEFAULT 'RESERVED',
        booking_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        admin_notes  TEXT,
        FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);

    // AUTH LOGS
db.run(`
  CREATE TABLE IF NOT EXISTS auth_logs (
    log_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT,
    success     INTEGER,
    ip_address  TEXT,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

    console.log("SQLite schema initialised (tables ready).");
  });
};

initSchema();

module.exports = db;
