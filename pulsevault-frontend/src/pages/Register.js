import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
import { hasConsentedToCookies } from "../utils/cookieConsent";
import API from "../api";
import './Register.css';

const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [captchaToken, setCaptchaToken] = useState(null);
  const [message, setMessage] = useState("");

  // Real-time validation
  useEffect(() => {
    const newErrors = {};

    if (/\d/.test(formData.first_name)) {
      newErrors.first_name = "Names should not contain numbers.";
    }

    if (/\d/.test(formData.last_name)) {
      newErrors.last_name = "Names should not contain numbers.";
    }

    if (formData.password.length > 0 && !/^(?=.*[0-9!@#$%^&*])(?=.{8,})/.test(formData.password)) {
      newErrors.password = "Password must be 8+ characters and include a number or special character.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [formData.first_name, formData.last_name, formData.password]);

  // Check username uniqueness
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username) return;

      try {
        const response = await API.get(`/auth/check-username?username=${formData.username}`);
        setErrors((prev) => ({
          ...prev,
          username: response.data.available ? "" : "Username is already taken."
        }));
      } catch (error) {
        console.error("Error checking username:", error);
      }
    };

    const delay = setTimeout(checkUsername, 500); // debounce

    return () => clearTimeout(delay);
  }, [formData.username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Prevent submission if cookies are not accepted
    if (!hasConsentedToCookies()) {
      alert("You must accept cookies to register.");
      return;
    }

    // Final validation
    const validationErrors = {};
    if (/\d/.test(formData.first_name)) validationErrors.first_name = "Names should not contain numbers.";
    if (/\d/.test(formData.last_name)) validationErrors.last_name = "Names should not contain numbers.";
    if (!/^(?=.*[0-9!@#$%^&*])(?=.{8,})/.test(formData.password)) {
      validationErrors.password = "Password must be 8+ characters and include a number or special character.";
    }
    if (errors.username) validationErrors.username = errors.username;
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!captchaToken) {
      return setMessage("Please verify reCAPTCHA");
    }

    try {
      const response = await API.post("/auth/register", {
        ...formData,
        captcha: captchaToken,
      });

      setMessage(response.data.message);

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
      <div className="login-prompt">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        {errors.first_name && <p className="field-error">{errors.first_name}</p>}

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        {errors.last_name && <p className="field-error">{errors.last_name}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <p className="field-error">{errors.username}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <ReCAPTCHA sitekey={SITE_KEY} onChange={handleCaptchaChange} />

        <button type="submit">CREATE AN ACCOUNT</button>
      </form>
    </div>
  );
}

export default Register;
