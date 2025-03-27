import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import './Register.css';
import API from "../api"; 

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
console.log("🧪 SITE_KEY:", SITE_KEY); 


function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (token) => {
    console.log("🔐 CAPTCHA Token:", token);
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with token:", captchaToken);

    if(!captchaToken) {
      return setMessage("Please verify reCAPTCHA");
    }

    try {
      const response = await API.post("/auth/register", {
        ...formData,
        captcha: captchaToken,
      });
      setMessage(response.data.message);

    // Redirect to login after short delay
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  } catch (error) {
    setMessage(error.response?.data?.error || "Registration failed.");
  }
};

  return (
    <div className="register-container">
      <h2>Sign up</h2>
      <div className= "login-prompt">
      Already have an account? <Link to="/login">Log in</Link>
      </div>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <ReCAPTCHA
          sitekey={SITE_KEY}
          onChange={handleCaptchaChange}
        />

        <button type="submit">CREATE AN ACCOUNT</button>
      </form>
    </div>
  );
}

export default Register;
