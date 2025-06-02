import React, { useState, useEffect } from "react";
import "./Profile.css";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaUser, FaEnvelope, FaBirthdayCake, FaVenusMars, FaRulerVertical,
  FaPercentage, FaRunning, FaDumbbell, FaBicycle, FaTools
} from "react-icons/fa";

function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthday: "",
    sex: "Prefer not to say",
    height: "",
    bodyFat: "",
    activity: "",
    exercise: "",
    cardio: "",
    lifting: ""
  });

  const [lastSaved, setLastSaved] = useState("");

  const heightOptions = [];
  for (let ft = 4; ft <= 7; ft++) {
    for (let inch = 0; inch < 12; inch++) {
      if (ft === 7 && inch > 0) break;
      heightOptions.push(`${ft} ft${inch > 0 ? ` ${inch} in` : ""}`);
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/auth/profile", { withCredentials: true });
      const data = res.data;

      setFormData({
        name: data.username || "",
        email: data.email || "",
        birthday: data.birthday?.split("T")[0] || "",
        sex: data.sex || "Prefer not to say",
        height: data.height || "",
        bodyFat: data.bodyFat || "",
        activity: data.activity || "",
        exercise: data.exercise || "",
        cardio: data.cardio || "",
        lifting: data.lifting || ""
      });
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  const handleSave = async () => {
    try {
      const {
        name, email, birthday, sex, height,
        bodyFat, activity, exercise, cardio, lifting
      } = formData;

      await axios.put("/auth/profile", {
        username: name,
        email,
        birthday,
        sex,
        height,
        bodyFat,
        activity,
        exercise,
        cardio,
        lifting
      }, { withCredentials: true });

      toast.success("✅ Profile updated!");
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaved(`Profile saved at ${now}`);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "❌ Failed to update profile.");
      console.error(err);
    }
  };

  const handleCancel = () => {
    window.location.href = "/dashboard";
  };

  const handleDelete = async () => {
    if (window.confirm("⚠️ Are you sure you want to delete your profile? This action is irreversible.")) {
      try {
        await axios.delete("/auth/profile", { withCredentials: true });
        toast.success("🗑️ Profile deleted.");
        window.location.href = "/";
      } catch (err) {
        toast.error("❌ Failed to delete profile.");
        console.error(err);
      }
    }
  };

  const generalFields = [
    { label: "Name", icon: <FaUser />, name: "name", type: "text" },
    { label: "Email", icon: <FaEnvelope />, name: "email", type: "email" },
    { label: "Birthday", icon: <FaBirthdayCake />, name: "birthday", type: "date" },
    { label: "Sex", icon: <FaVenusMars />, name: "sex", type: "select", options: ["Male", "Female", "Prefer not to say"] },
    { label: "Height", icon: <FaRulerVertical />, name: "height", type: "select", options: heightOptions },
  ];

  const dynamicFields = [
    { label: "Body Fat", icon: <FaPercentage />, name: "bodyFat", type: "select", options: ["10–15%", "16–25%", "26–30%", "31–35%", "36–42%"] },
    { label: "Activity", icon: <FaRunning />, name: "activity", type: "select", options: ["Mostly Sedentary", "Lightly Active", "Moderately Active", "Very Active"] },
    { label: "Exercise", icon: <FaDumbbell />, name: "exercise", type: "select", options: ["0 sessions / week", "1–2 sessions / week", "3–5 sessions / week"] },
    { label: "Cardio", icon: <FaBicycle />, name: "cardio", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
    { label: "Lifting", icon: <FaTools />, name: "lifting", type: "select", options: ["None", "Light", "Moderate", "Heavy"] },
  ];

  const renderField = (field) => (
    <div className="profile-field" key={field.name}>
      <label>{field.label} {field.icon}</label>
      {field.type === "select" ? (
        <select name={field.name} value={formData[field.name]} onChange={handleChange}>
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} />
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <h2>Profile</h2>

      <div className="card">
        <h3>General</h3>
        {generalFields.map(renderField)}
      </div>

      <div className="card">
        <h3>Dynamic Data</h3>
        {dynamicFields.map(renderField)}
      </div>

      <div className="button-group">
        <button className="save-btn" onClick={handleSave}>Save</button>
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
      </div>

      <div className="delete-section">
        <button className="delete-btn" onClick={handleDelete}>Delete Profile</button>
      </div>

      {lastSaved && <p className="last-saved-note">{lastSaved}</p>}
    </div>
  );
}

export default Profile;
