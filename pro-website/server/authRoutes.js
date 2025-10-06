const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.js'); // Import the database connection

const router = express.Router();

// ===== REGISTRATION ROUTE =====
// URL: POST /api/auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Hash the password for security
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Store the user in the database
    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(sql, [username, hashedPassword], function(err) {
        if (err) {
            // Check for unique username constraint
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ message: "Username already exists." });
            }
            return res.status(500).json({ message: "Database error.", error: err.message });
        }
        res.status(201).json({ message: "User created successfully!", userId: this.lastID });
    });
});

// ===== LOGIN ROUTE =====
// URL: POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Find the user in the database
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error.", error: err.message });
        }
        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        // If password is correct, create a JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ message: "Login successful!", token: token });
    });
});

module.exports = router;