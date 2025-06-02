import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import heartMascot from '../assets/mascot.png'; // update the path if needed

function HeroSection() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleWatchDemo = () => {
    alert("🎬 Demo coming soon!");
  };

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        {/* Left: Text Block */}
        <div className="hero-text">
          <h1>Secure Your Pulse, Empower Your Future</h1>
          <p>
            Advanced heart monitoring & health security all in one app.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="ghost-btn" onClick={handleWatchDemo}>
              ▶ Watch Demo
            </button>
          </div>
        </div>

        {/* Right: Heart Mascot / Image */}
        <div className="hero-image">
          <img src={heartMascot} alt="Heart Mascot" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
