import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import logo from '../assets/pulsevault-logo.webp';

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); 

  const toggleMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false); // close menu on mobile
    if (window.location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <img src={logo} alt="PulseVault Logo" className="logo-image" />
          <span className="logo-text">PulseVault</span>
        </div>

        {/* Hamburger Icon */}
        <div className="hamburger" onClick={toggleMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Navigation Links */}
        <nav className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <button className="nav-link" onClick={() => handleNavClick('home')}>Home</button>
          <button className="nav-link" onClick={() => handleNavClick('features')}>Features</button>
          <button className="nav-link" onClick={() => handleNavClick('how')}>How It Works</button>
          <button className="nav-link" onClick={() => handleNavClick('about')}>About</button>
          <button className="nav-link" onClick={() => handleNavClick('contact')}>Contact</button>
          
          
          {/* Mobile-only buttons */}
          {isMobileMenuOpen && (
            <div className="navbar-mobile-actions">
              <button className="text-btn" onClick={closeMenu}>Login</button>
              <button className="primary-btn" onClick={() => {
                closeMenu();
                navigate('/register');
              }}>
                Sign Up
              </button>
            </div>
          )}            
          
        </nav>

        {/* Desktop-only buttons */}
        {!isMobileMenuOpen && (
          <div className="navbar-actions">
            <button className="text-btn">Login</button>
            <button className="primary-btn" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
