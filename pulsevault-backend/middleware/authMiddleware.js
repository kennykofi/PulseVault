const jwt = require('jsonwebtoken');
require('dotenv').config();

//Middleware to authenticate user via JWT stored in cookies.
function authenticateToken(req, res, next) {
    const token = req.cookies.jwt; // Retrieve JWT from cookies
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user data to request
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid or expired token." });
    }
}

// Middleware to check if the user is an admin.
 
function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
}

module.exports = { authenticateToken, isAdmin };