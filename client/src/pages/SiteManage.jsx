// src/pages/SiteManage.jsx

import React, { useState } from "react";
import AddSiteForm from "../components/AddSiteForm/AddSiteForm";
import EditSiteTab from "../components/SiteForm/EditSiteTab"; // <-- use the external component!
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/addmember.css";
import "../assets/styles/siteform.css";
import { useNavigate } from "react-router-dom";

/**
 * SiteManage page - allows user to add or edit site via tabs.
 */
export default function SiteManage() {
  const [tab, setTab] = useState("add"); // 'add' | 'edit'
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // Handles success for add/edit forms
  const handleSuccess = (msg = "Operation successful!") => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="add-site-page">
      {/* Sticky header bar */}
      <div className="header-sticky-row">
        <div className="header-logo">
          <img src={logo} alt="SpHing Logo" style={{ width: 210, height: "auto", display: "block" }} />
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

      {/* Tab navigation */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "2rem",
        marginBottom: "1.4rem",
        gap: 12
      }}>
        <button
          className={`tab-btn${tab === "add" ? " active" : ""}`}
          style={tab === "add" ? tabActiveStyle : tabInactiveStyle}
          onClick={() => setTab("add")}
        >Add Site</button>
        <button
          className={`tab-btn${tab === "edit" ? " active" : ""}`}
          style={tab === "edit" ? tabActiveStyle : tabInactiveStyle}
          onClick={() => setTab("edit")}
        >Edit Site</button>
      </div>

      {/* Form content */}
      <div className="site-form-wrapper">
        {tab === "add" && (
          <AddSiteForm onSuccess={() => handleSuccess("Site added successfully!")} />
        )}
        {tab === "edit" && (
          <EditSiteTab onSuccess={handleSuccess} /> // <-- use the external EditSiteTab
        )}
        {successMsg && (
          <div className="success-message">{successMsg}</div>
        )}
      </div>
    </div>
  );
}

// Tab styles
const tabActiveStyle = {
  background: "#e3342f",
  color: "#fff",
  fontWeight: 700,
  borderRadius: 8,
  border: "none",
  padding: "10px 32px",
  fontSize: 18,
  boxShadow: "0 2px 8px #0002",
  cursor: "default",
  transition: "background 0.18s"
};
const tabInactiveStyle = {
  background: "#232629",
  color: "#ccc",
  fontWeight: 700,
  borderRadius: 8,
  border: "none",
  padding: "10px 32px",
  fontSize: 18,
  cursor: "pointer",
  transition: "background 0.18s"
};
