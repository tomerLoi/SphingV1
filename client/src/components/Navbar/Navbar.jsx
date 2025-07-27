import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/sphing_logo.png";
import AlertDropdown from "../Alerts/AlertDropdown"; 

export default function Navbar({ onLogout }) {
  const [seconds, setSeconds] = useState(10);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 10 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src={logo} alt="SpHing Logo" className="sphing-logo-img" />
      </div>

      {/* (Removed the separate timer) */}

      {/* Buttons */}
      <div className="navbar-buttons">
        <button onClick={() => navigate("/add-site")}>Add Site</button>
        <button onClick={() => navigate("/edit-site")}>Edit Site</button>
        <button onClick={() => navigate("/team-members")}>Members</button>

        {/* Refresh button with timer inside */}
        <button className="navbar-refresh">
          Refresh <span className="refresh-counter">
            {seconds.toString().padStart(2, "0")}
          </span>
        </button>

        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
