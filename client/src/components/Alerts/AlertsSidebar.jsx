// src/components/Alerts/AlertsSidebar.jsx

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { getAlerts } from "../../api/alerts"; // ← זה הייבוא הנכון
import "../../assets/styles/alerts.css";

export default function AlertsSidebar({ open, onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef();

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    // שימוש בפונקציה מה-api/alerts.js!
    getAlerts()
      .then((data) => {
        let arr = [];
        if (Array.isArray(data.logs)) arr = data.logs;
        else if (Array.isArray(data)) arr = data;
        setAlerts(arr.slice(0, 50));
        setLoading(false);
      })
      .catch(() => {
        setAlerts([]);
        setLoading(false);
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="alerts-overlay" />
      <aside className="alerts-sidebar" ref={sidebarRef}>
        <div className="alerts-sidebar-header">
          <div>
            Recent Alerts
            <div style={{ fontWeight: 400, fontSize: "1rem", color: "#bfc2c5", marginTop: "2px" }}>
              Last 50 events.
            </div>
          </div>
          <button className="alerts-close-btn" onClick={onClose} aria-label="Close alerts">
            <svg width="26" height="26" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="11" fill="#232629" />
              <line x1="6" y1="6" x2="16" y2="16" stroke="#e32840" strokeWidth="2.7" strokeLinecap="round" />
              <line x1="16" y1="6" x2="6" y2="16" stroke="#e32840" strokeWidth="2.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="alerts-sidebar-content">
          {loading ? (
            <div className="alerts-loading">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="alerts-empty">No alerts found.</div>
          ) : (
            alerts.map((alert, i) => (
              <div className="alert-item" key={i}>
                <div className="alert-title">
                  {alert.message || alert.title || "Unknown event"}
                </div>
                <div className="alert-time">
                  {alert.timestamp ? formatAlertTime(alert.timestamp) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

AlertsSidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

function formatAlertTime(dt) {
  try {
    const d = new Date(dt);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}, ${d.toLocaleTimeString("en-GB", { hour12: false })}`;
  } catch {
    return dt;
  }
}
