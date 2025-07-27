import React, { useEffect, useState } from "react";
import CONFIG from "../../config";

/**
 * NavbarAlert
 * - Shows the latest alert inline inside the navbar.
 * - On click, opens a floating popup with the full logs list.
 */
export default function NavbarAlert() {
  const [alerts, setAlerts] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch alerts from API
  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/alerts/`);
        if (!res.ok) throw new Error("Failed to fetch alerts");
        const data = await res.json();

        const logs = Array.isArray(data.logs) ? data.logs : [];
        const formatted = logs.map((log) => {
          const date = new Date(log.timestamp);
          const time = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return {
            time,
            msg: log.message,
            type: log.message.toLowerCase().includes("down")
              ? "critical"
              : "info",
          };
        });

        setAlerts(formatted);
        setError(null);
      } catch (err) {
        setError(err.message || "Unknown error");
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const latestAlert = alerts[0] || null;

  return (
    <div className="navbar-alerts">
      {/* Inline latest alert */}
      {loading && <div className="navbar-alert-msg">Loading...</div>}
      {error && <div className="navbar-alert-msg">Error: {error}</div>}
      {!loading && !error && latestAlert && (
        <div
          className="navbar-alert-msg latest"
          onClick={() => setPopupOpen(!popupOpen)}
          style={{ cursor: "pointer" }}
        >
          <span className="alert-time">{latestAlert.time}</span>
          <span
            className={
              "alert-msg" +
              (latestAlert.type === "critical" ? " alert-critical" : "")
            }
          >
            {latestAlert.msg}
          </span>
        </div>
      )}

      {/* Popup with full logs */}
      {popupOpen && (
        <div className="alerts-popup">
          <div className="alerts-popup-header">
            <span>All Alerts</span>
            <button onClick={() => setPopupOpen(false)}>✕</button>
          </div>
          <div className="alerts-popup-body">
            {alerts.length === 0 && <p>No alerts available</p>}
            {alerts.map((alert, i) => (
              <div key={i} className="alerts-popup-item">
                <span className="alert-time">{alert.time}</span>
                <span
                  className={
                    "alert-msg" +
                    (alert.type === "critical" ? " alert-critical" : "")
                  }
                >
                  {alert.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
