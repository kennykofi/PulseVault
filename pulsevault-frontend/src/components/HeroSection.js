
import React from 'react';
import './HeroSection.css';
import heartMascot from '../assets/mascot.png'; // replace with your image path
function HeroSection() {
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
            <button className="primary-btn">Get Started</button>
            <button className="ghost-btn">▶ Watch Demo</button>
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
