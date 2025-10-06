const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // रिक्वेस्ट के हेडर से 'authorization' की वैल्यू निकालें
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: "No token provided!" });
    }

    // 'Bearer ' शब्द को हटाकर सिर्फ टोकन निकालें
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: "Token format is incorrect." });
    }

    // टोकन को वेरिफाई करें
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized! Invalid token." });
        }
        // अगर टोकन सही है, तो यूजर की ID को रिक्वेस्ट में जोड़ दें
        req.userId = decoded.id;
        next(); // अगली प्रक्रिया पर जाएं
    });
};

module.exports = verifyToken;