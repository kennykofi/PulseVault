const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const { loginLimiter } = require('../middleware/rateLimit'); //Import rate-limiting
require('dotenv').config();

const router = express.Router();
router.use(cookieParser()); // Enable cookie support

// ✅ Function to Generate Access Token (Short-lived)
const generateAccessToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Access token expires in 15 minutes
    );
};

// ✅ Function to Generate Refresh Token (Longer-Lived)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_REFRESH_SECRET, // Use a separate refresh secret
        { expiresIn: '7d' } // Refresh token lasts 7 days
    );
};

// ✅ User Registration
router.post('/register', async (req, res) => {
    const { first_name, last_name, username, email, password, role } = req.body;
    try {
        const existingUser = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1 OR username = $2", [email, username]);
        if (existingUser.rows.length > 0) return res.status(400).json({ error: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO pulsevault.users (first_name, last_name, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
            [first_name, last_name, username, email, hashedPassword, role || 'user']
        );

        res.status(201).json({ message: "✅ User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ User Login with Security Logging & Rate-Limiting
router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown IP';

    try {
        const userQuery = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1", [email]);

        if (userQuery.rows.length === 0) {
            console.log("⚠️ User not found. Logging failed login attempt.");
            await pool.query(
                "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())", 
                [null, ip_address, "Login", "Failed"]
            );
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = userQuery.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log(`⚠️ Incorrect password for user: ${user.user_id}`);
            await pool.query(
                "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())", 
                [user.user_id, ip_address, "Login", "Failed"]
            );
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Log successful login
        console.log(`🔓 Successful login for user: ${user.user_id}`);
        await pool.query(
            "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())", 
            [user.user_id, ip_address, "Login", "Success"]
        );

        // Generate Access Token & Refresh Token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in DB
        await pool.query(
            "INSERT INTO pulsevault.refresh_tokens (user_id, token) VALUES ($1, $2)",
            [user.user_id, refreshToken]
        );

        // ✅ Set HTTP-only cookies for tokens
        res.cookie('jwt', accessToken, { 
            httpOnly: true, 
            secure: false, 
            sameSite: 'Strict', 
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: false, // Change to true in production with HTTPS
            sameSite: 'Strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: "✅ Login successful" });

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: "Server error during login" });
    }
});

// ✅ Refresh Token Route (Generate a New Access Token)
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await pool.query("SELECT * FROM pulsevault.users WHERE user_id = $1", [decoded.user_id]);

        if (user.rows.length === 0) return res.status(403).json({ error: "Invalid refresh token" });

        const newAccessToken = generateAccessToken(user.rows[0]);

        res.cookie('jwt', newAccessToken, { 
            httpOnly: true, 
            secure: false, // Change to true in production with HTTPS
            sameSite: 'Strict', 
            maxAge: 15 * 60 * 1000 
        });

        res.json({ message: "✅ Token refreshed successfully" });

    } catch (err) {
        res.status(403).json({ error: "Invalid or expired refresh token" });
    }
});

// ✅ Logout Route (Blacklist JWT)
router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await pool.query("DELETE FROM pulsevault.refresh_tokens WHERE token = $1", [refreshToken]);
    }
    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    res.json({ message: "✅ Logged out successfully" });
});

module.exports = router;