const express = require('express');
const pool = require('../db');
const router = express.Router();

//Log Heart Rate Data
router.post('/log', async (req, res) => {
  const user_id = parseInt(req.body.user_id, 10);
  const heart_rate = parseInt(req.body.heart_rate, 10);

  if (isNaN(user_id)|| isNaN(heart_rate)) {
    return res.status(400).json({ error: "User ID and Heart Rate must be valid numbers" });
  }

  try {
    await pool.query(
      "INSERT INTO pulsevault.heart_rate_logs (user_id, heart_rate, log_time) VALUES ($1, $2, NOW())",
      [user_id, heart_rate]
    );
    res.json({ message: "✅ Heart rate logged successfully!"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get User Heart Rate Data
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const logs = await pool.query(
      "SELECT heart_rate, log_time FROM pulsevault.heart_rate_logs WHERE user_id = $1 ORDER BY log_time DESC", 
      [user_id]
    );

    res.json({ user_id, heart_rate_logs: logs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;