import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm/LoginForm";
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/login.css";
import CONFIG from "../config";

// You do NOT need API_URL if you use CONFIG, but it's OK if you want to keep both.

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Always remove old token on login page mount!
    sessionStorage.removeItem("auth_token");
  }, []);

  // Handles login form submission
  const handleLogin = async ({ username, password }) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      // <--- HERE is the FIX:
      if (res.ok && data.token) {
        // Save token and update login state
        sessionStorage.setItem("auth_token", data.token);
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        // Show backend error or fallback message
        alert(data.detail || "Login failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="login-form-root">
      <div className="login-logo-wrapper">
        <img src={logo} alt="SpHing Logo" className="login-logo-img" />
      </div>
      {/* LoginForm will call handleLogin on submit */}
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
