import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/sphing_logo.png";
import AlertsSidebar from "../Alerts/AlertsSidebar";
import "../../assets/styles/alerts.css";
import "../../assets/styles/navbar.css";

export default function Navbar({
  onLogout,
  seconds = 10,
  onRefreshClick = () => {},
}) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        {/* Logo on the left */}
        <div className="navbar-logo">
          <img src={logo} alt="SpHing Logo" className="sphing-logo-img" />
        </div>
        {/* All navbar buttons */}
        <div className="navbar-buttons">
          <button className="navbar-btn" onClick={() => navigate("/add-site")}>
            Add Site
          </button>
          <button className="navbar-btn" onClick={() => navigate("/team-members")}>
            Members
          </button>
          {/* Profile button with user icon */}
          <button className="navbar-btn" onClick={() => navigate("/profile")}>
            <span className="navbar-btn-icon" style={{ marginRight: 6 }}>
              {/* Inline SVG user icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
            </span>
            Profile
          </button>
          {/* Refresh button with countdown, calls parent callback
          <button
            className="navbar-btn navbar-refresh"
            onClick={onRefreshClick}
          >
            Refresh <span className="refresh-counter">{seconds.toString().padStart(2, "0")}</span>
          </button> */}
          {/* Bell/alerts button */}
          <button className="navbar-btn navbar-bell" onClick={() => setAlertsOpen(true)}>
            <span className="bell-icon" style={{ position: "relative" }}>
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 17v-6a6 6 0 10-12 0v6a2 2 0 01-2 2h16a2 2 0 01-2-2z"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {/* Notification dot */}
              <span className="bell-dot"></span>
            </span>
          </button>
          <button className="navbar-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>
      {/* Alerts sidebar */}
      <AlertsSidebar open={alertsOpen} onClose={() => setAlertsOpen(false)} />
    </>
  );
}
