import React from 'react';
import './FeaturesSection.css';

function FeaturesSection() {
  const features = [
    {
      icon: "💓",
      title: "Real-Time Monitoring",
      text: "Track your heart rate in real time with medical-grade accuracy."
    },
    {
      icon: "🔐",
      title: "Data Privacy First",
      text: "Your health data is encrypted and securely stored — always."
    },
    {
      icon: "📈",
      title: "Health Insights",
      text: "Get personalized analytics and trends based on your vitals."
    }
  ];

  return (
    <section className="features" id="features">
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-box" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
