require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // database connection
const cookieParser = require('cookie-parser');

const app = express();

// ✅ CORS Configuration (Fixes 'Access-Control-Allow-Origin' Error)
app.use(cors({
  origin: "http://localhost:3000", // ✅ Allow only frontend requests
  credentials: true, // ✅ Allow cookies and authentication headers
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('PulseVault API is running!');
});

app.get('/protected', (req, res) => {
  console.log("Received Cookies:", req.cookies); // Log received cookies
  if (!req.cookies.jwt) {
      return res.status(401).json({ error: "Access denied. No token provided." });
  }
  res.json({ message: "🔒 Protected route accessed!", user: req.user });
});

// ✅ Import Routes
const authRoutes = require('./routes/auth');
const heartRateRoutes = require('./routes/heartRate');
const securityLogRoutes = require('./routes/securityLog');

app.use('/auth', authRoutes);
app.use('/heartRate', heartRateRoutes);
app.use('/securityLog', securityLogRoutes);

// ✅ Database Connection Test Route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "✅ Database connected!", time: result.rows[0].now });
  } catch (error) {
    console.error("❌ Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
