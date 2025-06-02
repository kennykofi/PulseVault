const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const cookieParser = require('cookie-parser');
const { loginLimiter } = require('../middleware/rateLimit');
const sendOtpEmail = require('../middleware/sendOtpEmail');
const sendResetEmail = require("../middleware/sendResetEmail");
const { authenticateToken } = require('../middleware/authMiddleware');

require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

// === JWT Helpers ===
const generateAccessToken = (user) => jwt.sign(
  { user_id: user.user_id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const generateRefreshToken = (user) => jwt.sign(
  { user_id: user.user_id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

// === Register ===
router.post('/register', async (req, res) => {
  const { first_name, last_name, username, email, password, role, captcha } = req.body;
  if (!captcha) return res.status(400).json({ error: "CAPTCHA required!" });

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: captcha
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!response.data.success)
      return res.status(400).json({ error: "CAPTCHA verification failed" });

    const existingUser = await pool.query(
      "SELECT * FROM pulsevault.users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existingUser.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO pulsevault.users (first_name, last_name, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [first_name, last_name, username, email, hashedPassword, role || 'user']
    );

    res.status(201).json({ message: "✅ User registered successfully!" });

  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// === Username Availability Check ===
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  try {
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length > 0) {
      return res.json({ available: false });
    }
    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while checking username." });
  }
});

// === Login with OTP ===
router.post('/login', loginLimiter, async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';

  try {
    const userQuery = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1", [email]);
    if (userQuery.rows.length === 0) {
      await pool.query(
        "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, 'Login', 'Failed', NOW())",
        [null, ip_address]
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userQuery.rows[0];

    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return res.status(403).json({ error: `Account locked until ${user.lockout_until}` });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const newAttempts = user.failed_attempts + 1;
      const lockoutUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await pool.query(
        "UPDATE pulsevault.users SET failed_attempts = $1, lockout_until = $2 WHERE email = $3",
        [newAttempts, lockoutUntil, email]
      );

      await pool.query(
        "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, 'Login', 'Failed', NOW())",
        [user.user_id, ip_address]
      );

      const remaining = 5 - newAttempts;
      return res.status(401).json({
        error: remaining > 0 ? `Invalid credentials. ${remaining} attempts remaining.` : `Account locked. Try again after ${lockoutUntil}`
      });
    }

    await pool.query("UPDATE pulsevault.users SET failed_attempts = 0, lockout_until = NULL WHERE email = $1", [email]);

    await pool.query(
      "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, 'Login', 'Success', NOW())",
      [user.user_id, ip_address]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO pulsevault.otp_codes (user_id, otp_code, expires_at) VALUES ($1, $2, $3)",
      [user.user_id, otp, expires_at]
    );

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent", user_id: user.user_id });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// === OTP Verification ===
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const userQuery = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1", [email]);
    if (userQuery.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = userQuery.rows[0];

    const result = await pool.query(
      "SELECT * FROM pulsevault.otp_codes WHERE user_id = $1 AND otp_code = $2 ORDER BY expires_at DESC LIMIT 1",
      [user.user_id, otp]
    );

    if (result.rows.length === 0 || new Date(result.rows[0].expires_at) < new Date()) {
      return res.status(401).json({ error: "OTP invalid or expired" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query(
      "INSERT INTO pulsevault.refresh_tokens (user_id, token) VALUES ($1, $2)",
      [user.user_id, refreshToken]
    );

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await pool.query(
      "INSERT INTO pulsevault.sessions (user_id, token, expires_at, ip_address) VALUES ($1, $2, $3, $4)",
      [user.user_id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), req.ip]
    );

    res.json({ message: "Login complete with OTP" });

  } catch (err) {
    console.error("❌ OTP verification failed:", err.message);
    res.status(500).json({ error: "Server error verifying OTP" });
  }
});

// === Refresh Access Token ===
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
      secure: false,
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Token refreshed" });

  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

// === Logout ===
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await pool.query("DELETE FROM pulsevault.refresh_tokens WHERE token = $1", [refreshToken]);
  }

  res.clearCookie('jwt');
  res.clearCookie('refreshToken');
  res.json({ message: "Logged out successfully" });
});

// === GET Logged-in User Profile ===
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const result = await pool.query(
      `SELECT user_id, username, email, birthday, sex, height,
              body_fat, activity_level, exercise_freq,
              cardio_level, lifting_level
       FROM pulsevault.users WHERE user_id = $1`,
      [userId]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({
      user_id: user.user_id, 
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      sex: user.sex,
      height: user.height,
      bodyFat: user.body_fat,
      activity: user.activity_level,
      exercise: user.exercise_freq,
      cardio: user.cardio_level,
      lifting: user.lifting_level
    });
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// === Update Profile ===
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      username, email, birthday, sex, height,
      bodyFat, activity, exercise, cardio, lifting
    } = req.body;

    await pool.query(
      `UPDATE pulsevault.users SET
        username = $1,
        email = $2,
        birthday = $3,
        sex = $4,
        height = $5,
        body_fat = $6,
        activity_level = $7,
        exercise_freq = $8,
        cardio_level = $9,
        lifting_level = $10
       WHERE user_id = $11`,
      [
        username, email, birthday, sex, height,
        bodyFat, activity, exercise, cardio, lifting, userId
      ]
    );

    res.json({ message: "Profile updated!" });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

// === Delete Profile ===
router.delete("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    // Delete related data 
    await pool.query("DELETE FROM pulsevault.heart_rate_logs WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM pulsevault.otp_codes WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM pulsevault.sessions WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM pulsevault.refresh_tokens WHERE user_id = $1", [userId]);
    await pool.query("DELETE FROM pulsevault.security_logs WHERE user_id = $1", [userId]);

    // Delete the user
    await pool.query("DELETE FROM pulsevault.users WHERE user_id = $1", [userId]);

    res.clearCookie("jwt");
    res.clearCookie("refreshToken");

    res.json({ message: "Your account has been permanently deleted." });
  } catch (err) {
    console.error("Error deleting user profile:", err.message);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});


module.exports = router;
