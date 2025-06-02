import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
import HowItWorksSection from './components/HowItWorksSection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import Register from './pages/Register';
import Login from './pages/Login';
import CookiePolicy from './pages/CookiePolicy';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Home page layout
function HomePage({ onPrivacyClick }) {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Contact />
      <Footer onPrivacyClick={onPrivacyClick} />
    </>
  );
}

// App wrapper for layout-aware rendering
function AppWrapper({
  onPrivacyClick,
  showBanner,
  handleAccept,
  handleReject,
  handleSettings
}) {
  const location = useLocation();

  const hideNavbar = [
    '/dashboard',
    '/profile',
    '/settings',
  ].some((route) => location.pathname.startsWith(route));

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage onPrivacyClick={onPrivacyClick} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* ✅ Controlled cookie banner visibility */}
      {!hideNavbar && (
        <CookieBanner
          visible={showBanner}
          onAccept={handleAccept}
          onReject={handleReject}
          onSettings={handleSettings}
        />
      )}
    </>
  );
}

// Root App component
function App() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const preference = localStorage.getItem('cookie-preference');
    if (!preference) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem('cookie-preference', 'accepted');
    setShowBanner(false);
  }, []);

  const handleReject = useCallback(() => {
    localStorage.setItem('cookie-preference', 'rejected');
    setShowBanner(false);
  }, []);

  const handleSettings = useCallback(() => {
    setShowBanner(true); // ✅ Triggers banner to appear
  }, []);

  return (
    <Router>
      <AppWrapper
        onPrivacyClick={handleSettings}
        showBanner={showBanner}
        handleAccept={handleAccept}
        handleReject={handleReject}
        handleSettings={handleSettings}
      />
      <ToastContainer position="bottom-center" />
    </Router>
  );
}

export default App;
