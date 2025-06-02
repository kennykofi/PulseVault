const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware: Authenticate user via JWT from cookies
function authenticateToken(req, res, next) {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name == 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired. Please log in again."})
    }
    console.error("❌ JWT verification failed:", err.message);
    return res.status(403).json({ error: "Invalid token." });
  }
}

//  Middleware: Check if user is admin
function isAdmin(req, res, next) {
  if (!req.user || typeof req.user.role !== 'string' || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
}

module.exports = { authenticateToken, isAdmin };
