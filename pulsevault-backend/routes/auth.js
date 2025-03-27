const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const cookieParser = require('cookie-parser');
const { loginLimiter } = require('../middleware/rateLimit');
const sendOtpEmail = require('../middleware/sendOtpEmail');

require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Register
router.post('/register', async (req, res) => {
  const { first_name, last_name, username, email, password, role, captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ error: "CAPTCHA required!" });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: captcha,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ error: "CAPTCHA verification failed" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM pulsevault.users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

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

// ✅ Login + OTP generation
router.post('/login', loginLimiter, async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP';

  try {
    const userQuery = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1", [email]);

    if (userQuery.rows.length === 0) {
      await pool.query(
        "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())",
        [null, ip_address, "Login", "Failed"]
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userQuery.rows[0];

    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return res.status(403).json({ error: `Account locked. Try again after ${user.lockout_until}` });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const newAttempts = user.failed_attempts + 1;
      let lockoutUntil = null;

      if (newAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await pool.query(
        "UPDATE pulsevault.users SET failed_attempts = $1, lockout_until = $2 WHERE email = $3",
        [newAttempts, lockoutUntil, email]
      );

      await pool.query(
        "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())",
        [user.user_id, ip_address, "Login", "Failed"]
      );

      const remaining = 5 - newAttempts;
      if (remaining > 0) {
        return res.status(401).json({ error: `Invalid credentials. ${remaining} attempts remaining.` });
      } else {
        return res.status(403).json({ error: `Account locked. Try again after ${lockoutUntil}` });
      }
    }

    await pool.query("UPDATE pulsevault.users SET failed_attempts = 0, lockout_until = NULL WHERE email = $1", [email]);

    await pool.query(
      "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())",
      [user.user_id, ip_address, "Login", "Success"]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO pulsevault.otp_codes (user_id, otp_code, expires_at) VALUES ($1, $2, $3)",
      [user.user_id, otp, expires_at]
    );

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "✅ OTP sent to email. Proceed to verify.", user_id: user.user_id });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// ✅ OTP Verification
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const userQuery = await pool.query("SELECT * FROM pulsevault.users WHERE email = $1", [email]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userQuery.rows[0];

    const result = await pool.query(
      "SELECT * FROM pulsevault.otp_codes WHERE user_id = $1 AND otp_code = $2 ORDER BY expires_at DESC LIMIT 1",
      [user.user_id, otp]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired One Time Password" });
    }

    const otpRecord = result.rows[0];
    const now = new Date();

    if (now > new Date(otpRecord.expires_at)) {
      return res.status(401).json({ error: "One Time Password has expired" });
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
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await pool.query(
      "INSERT INTO pulsevault.sessions (user_id, token, expires_at, ip_address) VALUES ($1, $2, $3, $4)",
      [
        user.user_id,
        refreshToken,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown IP'
      ]
    );

    res.json({ message: "✅ Login complete with OTP" });

  } catch (err) {
    console.error("❌ OTP verification failed:", err);
    res.status(500).json({ error: "Server error verifying OTP" });
  }
});

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

    res.json({ message: "✅ Token refreshed successfully" });

  } catch (err) {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

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
