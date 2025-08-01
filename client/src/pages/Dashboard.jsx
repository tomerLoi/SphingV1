import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar/Navbar";
import SiteList from "../components/SiteList/SiteList";
import "../assets/styles/dashboard.css";
import "../assets/styles/global.css";
import "../assets/styles/navbar.css";
import CONFIG from "../config";

const POLL_INTERVAL_SEC = 10; // How many seconds between each poll

export default function Dashboard({ onLogout }) {
  const [sitesData, setSitesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_SEC);
  const intervalRef = useRef();

  // Fetch sites from the backend API
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

  // Initial load and polling logic
  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchSites(false); // Background refresh, no spinner
          return POLL_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Manual refresh handler for Refresh button
  function handleManualRefresh() {
    setCountdown(POLL_INTERVAL_SEC); // Reset timer to 10
    fetchSites(); // Fetch data with loading spinner
  }

  if (loading) return <div className="dashboard-main">Loading...</div>;
  if (error) return <div className="dashboard-main">Error: {error}</div>;

  return (
    <div>
      <Navbar
        onLogout={onLogout}
        seconds={countdown}
        onRefreshClick={handleManualRefresh}
      />
      <div className="dashboard-main">
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
