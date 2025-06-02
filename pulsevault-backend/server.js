require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimit');

const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(apiLimiter);

//Base route
app.get('/', (req, res) => {
  res.send('PulseVault API is running!');
});

//Protected middleware route test
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: "🔒 Protected route accessed!", user: req.user });
});

//Admin-only route
app.get('/admin-only', authenticateToken, isAdmin, (req, res) => {
  res.json({ message: "🔑 Admin access granted!" });
});

//Routes
const authRoutes = require('./routes/auth');
const heartRateRoutes = require('./routes/heartRate');
const securityLogRoutes = require('./routes/securityLog');

app.use('/auth', authRoutes);
app.use('/heartRate', heartRateRoutes);
app.use('/securityLog', securityLogRoutes);


//DB connection test
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0].now });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
