import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import BPMChartRecharts from "../components/BPMChart";
import GradientLegend from "../components/GradientLegend";
import InputTrendChart from "../components/InputTrendChart";
import {
  FaHome,
  FaUserAlt,
  FaCog,
  FaSignOutAlt,
  FaClock,
  FaDumbbell,
  FaChartBar,
  FaDownload,
  FaRegCalendarAlt,
  FaHeartbeat,
  FaMoon,
  FaSun
} from "react-icons/fa";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const quotes = [
  { text: "Take care of your body. It’s the only place you have to live.", author: "Jim Rohn" },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich" },
  { text: "Health is not valued till sickness comes.", author: "Thomas Fuller" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
  { text: "Your body hears everything your mind says. Stay positive.", author: "Naomi Judd" }
];

function Dashboard() {
  const [bpm, setBpm] = useState("");
  const [status, setStatus] = useState(null);
  const [user, setUser] = useState({});
  const [logoutMessage, setLogoutMessage] = useState("");
  const [healthTip, setHealthTip] = useState("");
  const [weeklyBPM, setWeeklyBPM] = useState({});
  const [confirmedBPM, setConfirmedBPM] = useState(null);
  const [quote, setQuote] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showThemeToggle, setShowThemeToggle] = useState(false);

  const navigate = useNavigate();

  // 🌗 Handle light/dark theme
  useEffect(() => {
    document.body.classList.add("theme-transition");
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const timeout = setTimeout(() => {
      document.body.classList.remove("theme-transition");
    }, 400);
    return () => clearTimeout(timeout);
  }, [theme]);

  useEffect(() => {
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(random);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5001/auth/profile", {
      method: "GET",
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data?.user_id) {
          setUser(data);
        } else {
          console.warn("User ID missing from profile response:", data);
        }
      })
      .catch(err => {
        console.error("❌ Error fetching user profile:", err);
      });
  }, []);

  useEffect(() => {
    if (user.user_id) {
      fetchWeeklyLogs(user.user_id);
    }
  }, [user.user_id]);

  const fetchWeeklyLogs = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5001/heartRate/${userId}`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("❌ Invalid heart rate data format:", data);
        return;
      }

      const weekLog = {};
      data.forEach((log) => {
        const day = new Date(log.log_time).toLocaleDateString("en-US", {
          weekday: "long"
        });
        weekLog[day] = log.heart_rate;
      });

      setWeeklyBPM(weekLog);
    } catch (err) {
      console.error("❌ Error fetching heart rate logs:", err);
    }
  };

  const handleCheckBPM = async () => {
    const value = parseInt(bpm, 10);
    if (!value || !user.user_id) return;

    setConfirmedBPM(value);
    setStatus(value >= 60 && value <= 100 ? "Healthy" : "Not Healthy");

    if (value < 60) {
      setHealthTip("Your BPM is below normal. Try gentle movement or consult a doctor if you feel unwell.");
    } else if (value >= 60 && value <= 100) {
      setHealthTip("Your heart rate is optimal. Keep up the good work!");
    } else {
      setHealthTip("Your BPM is high. Consider light cardio, hydration, or deep breathing.");
    }

    try {
      const res = await fetch("http://localhost:5001/heartRate/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: user.user_id,
          heart_rate: value
        })
      });

      if (res.ok) {
        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long"
        });

        setWeeklyBPM((prev) => ({
          ...prev,
          [today]: value
        }));

        setBpm("");
      }
    } catch (err) {
      console.error("❌ Error logging BPM:", err);
    }
  };

  const handleLogout = () => {
    setLogoutMessage("Logging out... Redirecting to homepage.");
    setTimeout(() => navigate("/"), 2000);
  };

  const bpmData = weekdays.map((day) =>
    weeklyBPM.hasOwnProperty(day) ? weeklyBPM[day] : null
  );

  const averageBPM = Math.round(
    bpmData.filter(val => val !== null).reduce((a, b) => a + b, 0) /
    bpmData.filter(val => val !== null).length || 0
  );

  return (
    <div className="dashboard">
      <div className="sidebar-wrapper always-open">
  <div className="logo-container">
    <img
      src={require("../assets/pulsevault-logo.webp")}
      alt="PulseVault Logo"
      className="dashboard-logo"
    />
  </div>

  <div className="sidebar-icons">
    <button title="Home" onClick={() => navigate("/dashboard")}><FaHome /></button>
    <button title="Profile" onClick={() => navigate("/profile")}><FaUserAlt /></button>

    {/* ⚙️ Settings toggle */}
    <button title="Settings" onClick={() => setShowThemeToggle(prev => !prev)}><FaCog /></button>

    {/* 🌞 / 🌙 mode options (only shown if toggled open) */}
    {showThemeToggle && (
      <div className="theme-options">
        <button title="Light Mode" onClick={() => setTheme("light")}><FaSun /></button>
        <button title="Dark Mode" onClick={() => setTheme("dark")}><FaMoon /></button>
      </div>
    )}

    <button title="Logout" onClick={handleLogout}><FaSignOutAlt /></button>
  </div>
</div>
      <div className="dashboard-main">
        <h2>Hi, {user.first_name || user.username} 😊</h2>
        <p className="dashboard-subtext">Effortlessly record and analyse your heart</p>
        <h2 className="dashboard-title">Heart Rate Monitoring</h2>
        {logoutMessage && <p className="logout-message">{logoutMessage}</p>}

        {quote && (
          <div className="quote-card">
            <p className="quote-text">“{quote.text}”</p>
            <span className="quote-author">— {quote.author}</span>
          </div>
        )}

        <div className="bpm-input-wrapper">
          <input
            type="number"
            placeholder="Enter your BPM"
            value={bpm || ""}
            onChange={(e) => setBpm(e.target.value)}
          />
          <button onClick={handleCheckBPM}>Check Health</button>
        </div>

        {confirmedBPM && (
          <>
            <div className="bpm-inline-header">
              <span className="bpm-value">{confirmedBPM}</span>
              <span className="bpm-unit">BPM ❤️</span>
            </div>
            {status && <p className="bpm-status">{status}</p>}
            {healthTip && <p className="health-tip">{healthTip}</p>}
          </>
        )}

        {bpmData.some(val => val !== null) && (
          <div className="chart-row">
            <div className="bpm-bar-card">
              <BPMChartRecharts bpmData={bpmData} />
              <div className="bpm-legend-labels">
                <span className="bpm-average-value">
                  Average heart rate: <strong>{averageBPM} BPM</strong>
                </span>
                <span className="bpm-range-label">
                  Level: <strong>Average (69 - 99)</strong>
                </span>
              </div>
              <div className="bpm-current-value">
                Current BPM: <strong>{confirmedBPM ? `${confirmedBPM} BPM` : "— BPM"}</strong>
              </div>
              <GradientLegend currentBPM={confirmedBPM} />
            </div>

            <div className="spike-card">
              <InputTrendChart bpmData={bpmData} />
            </div>
          </div>
        )}

        <div className="coming-soon-horizontal">
          <h3 className="coming-soon-title">Coming Soon!</h3>
          <div className="coming-soon-features">
            <div className="feature-card" title="Coming soon..."><FaClock className="feature-icon" /><p>Link with Wearables</p></div>
            <div className="feature-card" title="Coming soon..."><FaRegCalendarAlt className="feature-icon" /><p>Health Reminders</p></div>
            <div className="feature-card" title="Coming soon..."><FaDumbbell className="feature-icon" /><p>Training Programs</p></div>
            <div className="feature-card" title="Coming soon..."><FaChartBar className="feature-icon" /><p>Advanced Analytics</p></div>
            <div className="feature-card" title="Coming soon..."><FaDownload className="feature-icon" /><p>Export Data</p></div>
            <div className="feature-card" title="Coming soon..."><FaHeartbeat className="feature-icon" /><p>Vitals Integration</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
