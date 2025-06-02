const express = require('express');
const pool = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Log Heart Rate Data (Protected Route)
router.post('/log', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const heart_rate = parseInt(req.body.heart_rate, 10);

  if (!user_id || isNaN(heart_rate)) {
    return res.status(400).json({ error: "Invalid user or heart rate" });
  }

  try {
    await pool.query(
      "INSERT INTO pulsevault.heart_rate_logs (user_id, heart_rate, log_time) VALUES ($1, $2, NOW())",
      [user_id, heart_rate]
    );
    res.json({ message: "✅ Heart rate logged successfully!" });
  } catch (err) {
    console.error("❌ Error logging heart rate:", err.message);
    res.status(500).json({ error: "Server error while logging heart rate" });
  }
});

//Get User Heart Rate Logs (Protected Route)
router.get('/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: "Invalid user ID in request" });
  }

  try {
    const result = await pool.query(
      "SELECT heart_rate, log_time FROM pulsevault.heart_rate_logs WHERE user_id = $1 ORDER BY log_time DESC",
      [user_id]
    );

    //Send only array of logs to match frontend expectations
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching heart rate logs:", err.message);
    res.status(500).json({ error: "Server error while fetching heart rate logs" });
  }
});

module.exports = router;

