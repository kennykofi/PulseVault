import React, { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/protected")
      .then((res) => setMessage(res.data.message))
      .catch((err) => setMessage(err.response?.data?.error || "Access denied"));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}

export default Dashboard;
