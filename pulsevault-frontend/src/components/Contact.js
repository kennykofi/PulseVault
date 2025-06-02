import React from "react";
import "./Contact.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa"; 

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container-dark">
        {/* Left Text Section */}
        <div className="contact-info-text">
          <h2>Have a question?</h2>
          <p>We’re just a message away!</p>

          <div className="contact-icons">
            <p><FaPhoneAlt /> +43 676 4294242 </p>
            <p><FaMapMarkerAlt /> Vienna, Austria</p>
            <p><FaEnvelope /> teampulsevault@gmail.com</p>
          </div>
      
        </div>

        {/* Right Form Section */}
        <div className="contact-form-dark">
          <h3> Get in touch</h3>
          <form>
            <div className="name-fields">
              <input type="text" placeholder="First name" required />
              <input type="text" placeholder="Last name" required />
            </div>
            <input type="email" placeholder="Email" required />
            <textarea placeholder="Your message" rows="5" required></textarea>
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
