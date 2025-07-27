import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import SiteList from "../components/SiteList/SiteList";
import "../assets/styles/dashboard.css";
import "../assets/styles/global.css";
import "../assets/styles/navbar.css";
import CONFIG from "../config";

const POLL_INTERVAL_SEC = 10; // Poll every 10 seconds

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [sitesData, setSitesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_SEC);
  const intervalRef = useRef();

  // Fetch sites function (extracted to call on-demand)
  async function fetchSites(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/sites/`);
      if (!res.ok) throw new Error("Failed to fetch sites data");
      const data = await res.json();
      setSitesData(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  // First load
  useEffect(() => {
    fetchSites();
  }, []);

  // Polling logic
  useEffect(() => {
    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchSites(false); // No spinner on background refresh
          return POLL_INTERVAL_SEC; // Reset counter after fetching
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return <div className="dashboard-main">Loading...</div>;
  if (error) return <div className="dashboard-main">Error: {error}</div>;

  return (
    <div>
      <Navbar onLogout={onLogout} />
      <div className="dashboard-main">
        {/* Countdown visual, can be styled */}
        <div style={{ 
          fontSize: 14, 
          color: "#BFC2C5", 
          position: "absolute", 
          top: 24, 
          right: 32 
        }}>
          Refreshing in <b>{countdown}</b>s
        </div>
        <div className="dashboard-sites-container-crowd">
          {sitesData.map((col) => (
            <SiteList
              key={col.continent}
              continent={col.continent}
              sites={col.sites}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
