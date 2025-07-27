// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

// This wrapper ensures user is authenticated before rendering children
export default function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
