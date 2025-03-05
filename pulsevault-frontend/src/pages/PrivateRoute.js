import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token"); // Check if JWT token is stored
  return token ? true : false;
};

const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
