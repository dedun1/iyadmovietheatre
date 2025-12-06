// createAdmin.js
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createAdmin() {
    const username = "admin1";
    const email = "admin@cinema.com";
    const password = "admin123";
    const passwordHash = bcrypt.hashSync(password, 10);

    const sql = `
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, 'admin')
    `;

    db.run(sql, [username, email, passwordHash], function(err) {
        if (err) {
            console.log("Error creating admin:", err.message);
            return;
        }
        console.log("Admin user created successfully!");
        process.exit();
    });
}

createAdmin();
