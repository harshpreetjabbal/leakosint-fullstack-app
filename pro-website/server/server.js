const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the database connection
const db = require('./database.js');

// Import the new authentication routes
const authRoutes = require('./authRoutes.js');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// A test route to check if the server is running
app.get('/', (req, res) => {
    res.json({ message: "Backend is running!" });
});

// Use the authentication routes
// All routes in authRoutes.js will be prefixed with /api/auth
app.use('/api/auth', authRoutes);


// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});