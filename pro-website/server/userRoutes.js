const express = require('express');
const db = require('./database.js');
const verifyToken = require('./authMiddleware.js');
const { datetime, timedelta } = require('datetime'); // We need datetime for subscriptions

const router = express.Router();

// ===== कॉन्फ़िगरेशन =====
const USD_TO_INR_RATE = 83.50;
const PLAN_PRICES_USD = {
    "daily": 0.50,
    "weekly": 2.00,
    "monthly": 3.00
};

// ===== रूट 1: यूजर प्रोफाइल और वॉलेट देखें (सुरक्षित) =====
// URL: GET /api/user/profile
router.get('/profile', verifyToken, (req, res) => {
    const sql = `SELECT id, username, balance_usd, subscription_end, currency FROM users WHERE id = ?`;
    db.get(sql, [req.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Database error." });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    });
});

// ===== रूट 2: शॉप के प्लान्स देखें (पब्लिक) =====
// URL: GET /api/user/shop/plans
router.get('/shop/plans', (req, res) => {
    res.status(200).json(PLAN_PRICES_USD);
});

// ===== रूट 3: वॉलेट से प्लान खरीदें (सुरक्षित) =====
// URL: POST /api/user/shop/purchase
router.post('/shop/purchase', verifyToken, (req, res) => {
    const { planType } = req.body; // e.g., "daily", "weekly"
    const userId = req.userId;

    if (!PLAN_PRICES_USD[planType]) {
        return res.status(400).json({ message: "Invalid plan type." });
    }

    const price_usd = PLAN_PRICES_USD[planType];

    // यूजर का बैलेंस चेक करें
    db.get(`SELECT balance_usd FROM users WHERE id = ?`, [userId], (err, user) => {
        if (user.balance_usd < price_usd) {
            return res.status(402).json({ message: "Insufficient balance." });
        }

        const new_balance_usd = user.balance_usd - price_usd;
        const now = new Date();
        let endDate;

        if (planType === "daily") endDate = new Date(now.setDate(now.getDate() + 1));
        else if (planType === "weekly") endDate = new Date(now.setDate(now.getDate() + 7));
        else if (planType === "monthly") endDate = new Date(now.setMonth(now.getMonth() + 1));
        
        const sql = `UPDATE users SET balance_usd = ?, subscription_end = ? WHERE id = ?`;
        db.run(sql, [new_balance_usd, endDate.toISOString(), userId], (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to update subscription." });
            }
            res.status(200).json({ message: `Successfully purchased ${planType} plan.` });
        });
    });
});

module.exports = router;