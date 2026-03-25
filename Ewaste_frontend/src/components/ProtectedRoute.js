// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../App";

const ProtectedRoute = ({ role, children }) => {
  const { auth } = useContext(AuthContext);

  // Not logged in at all
  if (!auth.token || !auth.role) {
    // Redirect to the appropriate login page based on required role
    if (role && role.toUpperCase() === "ADMIN") return <Navigate to="/admin-login" replace />;
    if (role && role.toUpperCase() === "PICKUP") return <Navigate to="/pickup-login" replace />;
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && auth.role.toUpperCase() !== role.toUpperCase()) {
    // Redirect to home if logged in but role doesn't match
    return <Navigate to="/" replace />;
  }

  // Logged in and role matches
  return children;
};

export default ProtectedRoute;
