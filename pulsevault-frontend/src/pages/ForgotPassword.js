import React, { useState } from "react";
import axios from "axios";
import "./ForgotPassword.css";
import pulsevaultLogo from "../assets/pulsevault-logo.webp";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    try {
      const res = await axios.post("/auth/request-password-reset", { email });
      setStatus(res.data.message);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-logo-wrapper">
        <img
          src={pulsevaultLogo}
          alt="PulseVault Logo"
          className="forgot-logo"
        />
      </div>

      <h2 className="forgot-heading">Forgot Password?</h2>
      <p className="forgot-subtext">
        Enter your email and we’ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          className="forgot-input"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="reset-button">
          Send Reset Link
        </button>
      </form>

      {status && <p className="success-message">{status}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ForgotPassword;
