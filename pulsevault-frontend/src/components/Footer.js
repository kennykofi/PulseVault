import React from "react";
import "./Footer.css";
import logo from "../assets/pulsevault-logo.webp";

function Footer({ onPrivacyClick }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-logo">
            <img src={logo} alt="PulseVault Logo" />
            <span>PulseVault</span>
          </div>

          <div className="footer-links">
            <a href="#home">Overview</a>
            <a href="#features">Features</a>
            <a href="#contact">Feedback</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <button className="footer-link-button" onClick={onPrivacyClick}>
              Privacy
            </button>
          </div>
        </div>

        <p className="footer-copy">© 2025 PulseVault. Prototype by Kenneth Kofi Asare.</p>
      </div>
    </footer>
  );
}

export default Footer;
