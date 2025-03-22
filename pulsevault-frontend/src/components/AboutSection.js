import React from 'react';
import './AboutSection.css';
import mockupImage from '../assets/African.png'; 
import { FaShieldAlt, FaBalanceScale, FaSeedling, FaHeartbeat } from 'react-icons/fa';

function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        {/* Left Text */}
        <div className="about-text">
          <h2>Our Mission is Your Heart's Safety</h2>
          <p>
            PulseVault combines advanced encryption and real-time monitoring to keep your health data secure.
            Our mission is to empower individuals to take control of their heart health with technology that cares.
          </p>
        </div>

        {/* Right Image */}
        <div className="about-image">
          <img src={mockupImage} alt="PulseVault Mockup" />
        </div>
      </div>

      {/* Values Section */}
      <div className="values">
        <h3>Our Values</h3>
        <div className="value-cards">
          <div className="value-card">
          <div className="icon-wrapper"><FaSeedling size={36} /></div>          
            <h4>Empowerment</h4>
            <p>Enabling healthier lives through data awareness.</p>
          </div>
          <div className="value-card">
            <div className="icon-wrapper"><FaShieldAlt size={36} /></div>
            <h4>Security</h4>
            <p>Your privacy is our top priority.</p>
          </div>
          <div className="value-card">
            <div className="icon-wrapper"><FaBalanceScale size={36} /></div>
            <h4>Balance</h4>
            <p>Technology meets care, seamlessly.</p>
          </div>
          <div className="value-card">
            <div className="icon-wrapper"><FaHeartbeat size={36} /></div>
            <h4>Impact</h4>
            <p>Driving change through accessible health tools.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;