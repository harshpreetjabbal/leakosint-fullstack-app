const sqlite3 = require('sqlite3').verbose();
const DB_FILE = "website_data.db";

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        setupDatabase();
    }
});

const setupDatabase = () => {
    db.serialize(() => {
        // यूजर्स टेबल
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                balance_usd REAL DEFAULT 0.0,
                subscription_end TEXT,
                currency TEXT DEFAULT 'INR'
            );
        `);
        // पेमेंट्स टेबल
        db.run(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                utr_number TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `);
        console.log("Database tables are ready.");
    });
};

module.exports = db;