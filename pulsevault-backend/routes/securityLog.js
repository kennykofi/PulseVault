const express = require('express');
const pool = require('../db');
const router = express.Router();
const moment = require('moment');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware'); 

// Log Security Events
router.post('/log', async (req, res) => {
  const { user_id, ip_address, attempt_type, status } = req.body;

  if (!ip_address || !attempt_type || !status) {
    return res.status(400).json({ error: "IP Address, Attempt Type, and Status are required" });
  }

  try {
    await pool.query(
      "INSERT INTO pulsevault.security_logs (user_id, ip_address, attempt_type, status, timestamp) VALUES ($1, $2, $3, $4, NOW())",
      [user_id || null, ip_address, attempt_type, status]
    );

    res.json({ message: "Security log recorded successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Security Logs for User (Requires Authentication)
router.get('/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  try {
    const logs = await pool.query(
      "SELECT ip_address, attempt_type, status, timestamp FROM pulsevault.security_logs WHERE user_id = $1 ORDER BY timestamp DESC",
      [user_id]
    );

    res.json({ user_id, security_logs: logs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-Only Route: Get All Security Logs
router.get('/admin/logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const logs = await pool.query("SELECT * FROM pulsevault.security_logs ORDER BY timestamp DESC");

    res.json({ security_logs: logs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;