import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";
import logo from "../assets/pulsevault-logo.webp";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (newPassword !== confirmPassword) {
      return setError("❌ Passwords do not match.");
    }

    try {
      const res = await axios.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      setStatus(res.data.message);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed.");
    }
  };

  return (
    <div className="reset-container">
      <img src={logo} alt="PulseVault Logo" className="reset-logo" />

      <h2>Reset Your Password</h2>
      <p className="form-subtitle">Enter and confirm your new password below.</p>

      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="reset-btn">Reset Password</button>
      </form>

      {status && <p className="success-message">{status}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ResetPassword;
