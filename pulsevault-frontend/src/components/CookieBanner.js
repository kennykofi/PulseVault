import React from "react";
import "./CookieBanner.css";

function CookieBanner({ visible, onAccept, onReject, onSettings }) {
  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <h3>We Value Your Privacy 🍪</h3>
        <p>
          We use essential cookies to make PulseVault work. We’d like to use optional cookies to improve your experience.
          Learn more in our{" "}
          <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">
            cookie policy
          </a>.
        </p>

        <div className="cookie-buttons">
          <button className="settings" onClick={onSettings}>
            Cookie Settings
          </button>
          <button className="reject" onClick={onReject}>
            Reject All
          </button>
          <button className="accept" onClick={onAccept}>
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;
