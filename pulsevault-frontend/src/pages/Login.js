import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import MascotPanel from "../components/MascotPanel";

// ✅ Setup axios baseURL globally
axios.defaults.baseURL = "http://localhost:5001";
axios.defaults.withCredentials = true;

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      // ✅ Redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "OTP verification failed.");
    }
  };

  return (
    <div className="login-container">
      <MascotPanel />

      <div className="form-panel">
        {step === "login" ? (
          <form onSubmit={handleLogin}>
            <h2>Welcome Back</h2>
            <p className="form-subtitle">Log in to access your dashboard!</p>

            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
            />

            <div className="form-options">
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" className="login-button">Log In</button>
            <div className="divider">OR</div>
            <p className="signup-prompt">
              Don’t have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="otp-container">
            <h2>Enter One-Time Password</h2>
            <p className="form-subtitle">We’ve sent a 6-digit code to your email</p>

            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            {error && <p className="error-mesage">{error}</p>}

            <button type="submit" className="login-button">Verify OTP</button>
            <div className="divider">OR</div>
            <button
              type="button"
              className="login-button"
              onClick={() => {
                setStep("login");
                setOtp("");
              }}
            >
              Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
