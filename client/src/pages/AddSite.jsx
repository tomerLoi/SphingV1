import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddSiteForm from "../components/AddSiteForm/AddSiteForm";
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/addmember.css"; // Reuse header styles
import "../assets/styles/siteform.css";  // Future-specific styles

export default function AddSite() {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");

  // Triggered after site creation succeeds
  const handleSuccess = () => {
    setSuccessMsg("Site added successfully!");
    setTimeout(() => setSuccessMsg(""), 4000); // Clear message after 4 seconds
  };

  return (
    <div className="add-site-page">
      {/* Top sticky row (logo + back button) */}
      <div className="header-sticky-row">
        <div className="header-logo">
          <img
            src={logo}
            alt="SpHing Logo"
            style={{ width: 210, height: "auto", display: "block" }}
          />
        </div>
        <div className="header-actions">
          <button
            className="back-to-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      {/* Centered form */}
      <div className="site-form-wrapper">
        <AddSiteForm onSuccess={handleSuccess} />
        {successMsg && <div className="success-message">{successMsg}</div>}
      </div>
    </div>
  );
}
