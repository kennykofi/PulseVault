import React from "react";
import "./HowItWorksSection.css";
import step1Img from "../assets/Login-cuate.png";
import step2Img from "../assets/heart-log.jpg";
import step3Img from "../assets/blood pressure.jpg";


function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how">
      <div className="how-header">
          <h2>How It Works</h2>
          <p className="how-description">
          PulseVault is a secure web-based health tracker designed to let log your heart rate and monitor your cardiovascular health with ease. 
          With built-in encryption and basic insights, PulseVault puts your heart data in your hands — safely and simply.
          </p>
        </div>
      
      <div className="steps">
        <div className="step-card">
          <img src={step1Img} alt="Register and Secure Login" />
          <h3>Step 1: Sign Up & Secure Login</h3>
          <p>
          Create an account with multi-layered security.
          PulseVault protects your health data, ensuring only You can access it safely.
          </p>
        </div>

      <div className="step-card">
        <img src={step2Img} alt="Manual Heart Rate Logging" />
        <h3>Step 2: Log Your Heart Rate</h3>
        <p>
        Manually enter your heart rate data into a clean, user-friendly
        dashboard. All entries are timestamped and encrypted, meeting
        GDPR/HIPAA standards.
        </p>
      </div>

      <div className="step-card">
        <img src={step3Img} alt="Basic Health Insights" />
        <h3>Step 3: View Simple Insights</h3>
        <p>
          Instantly see whether your heart rate is normal, high, or low.
          PulseVault offers straightforward insights to promote early health
            awareness – Simple, not overwhelming.
        </p>
      </div>
      </div>

    </section>
  );
}

export default HowItWorksSection;