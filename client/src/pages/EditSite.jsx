// src/pages/EditSite.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import logo from "../assets/images/sphing_logo.png";
import CONFIG from "../config";
import EditSiteForm from "../components/EditSiteForm/EditSiteForm";
import "../assets/styles/addmember.css"; // Sticky header/button styles
import "../assets/styles/siteform.css";  // Card/page-specific styles

const palette = {
  background: "#181A1B",
  card: "#232629",
  red: "#E71D32",
  text: "#FFFFFF",
};

const pageWrapper = {
  minHeight: "100vh",
  background: palette.background,
  fontFamily: "'Inter', Arial, sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: "7rem", // Leave space for sticky header
  paddingBottom: "3rem",
};

const cardStyle = {
  background: palette.card,
  borderRadius: 22,
  boxShadow: "0 4px 32px #0003",
  padding: "40px 40px 32px 40px",
  marginTop: "1rem",
  minWidth: 430,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative", // Needed for delete button inside
};

const cardTitle = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 28,
  marginBottom: 28,
  letterSpacing: 0.7,
};

const labelStyle = {
  color: "#e4e4e4",
  fontWeight: 600,
  fontSize: 19,
  marginBottom: 12,
  alignSelf: "flex-start",
};

const searchSelectStyle = {
  width: "100%",
  minWidth: 270,
  fontSize: 17,
  color: palette.text,
};

// Delete button (trash) style
const deleteBtnStyle = {
  position: "absolute",
  top: 16,
  right: 16,
  background: palette.red,
  border: "none",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  transition: "background 0.2s ease",
};

// Simple white trash icon
const trashIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    width="18"
    viewBox="0 0 24 24"
    fill="#FFFFFF"
  >
    <path d="M9 3v1H4v2h16V4h-5V3H9zm-3 5h12l-1.5 12.5c-.1.8-.8 1.5-1.6 1.5H9.1c-.8 0-1.5-.7-1.6-1.5L6 8z" />
  </svg>
);

export default function EditSite() {
  const navigate = useNavigate();
  const [sitesData, setSitesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Modal state for deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load all sites for the select dropdown
  useEffect(() => {
    async function fetchSites() {
      setLoading(true);
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/sites/`);
        if (!res.ok) throw new Error("Failed to fetch sites data");
        const data = await res.json();

        // Flatten sites by continent
        let flatSites = [];
        data.forEach(continent =>
          continent.sites.forEach(site =>
            flatSites.push({
              ...site,
              continent: continent.continent,
            })
          )
        );
        setSitesData(flatSites);
        setError(null);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  // Options for react-select
  const siteOptions = sitesData.map(site => ({
    value: site.site_id,
    label: `${site.site_name}${site.continent ? " (" + site.continent + ")" : ""}`,
  }));

  // Find selected site data by ID
  const selectedSiteData =
    selectedOption &&
    sitesData.find(s => String(s.site_id) === String(selectedOption.value));

  // Save site changes handler
  async function handleSave(updatedSite) {
    setSaveLoading(true);
    setSuccessMsg("");
    setError(null);
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/api/sites/${updatedSite.site_id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSite),
        }
      );
      if (!res.ok) throw new Error("Failed to save site data");
      setSuccessMsg("Site updated successfully!");
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setSaveLoading(false);
    }
  }

  // Handle site deletion with modal confirmation
  async function handleDelete() {
    if (!selectedSiteData) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/api/sites/${selectedSiteData.site_id}/`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete site");

      setSitesData(prev => prev.filter(s => s.site_id !== selectedSiteData.site_id));
      setSelectedOption(null);
      setShowDeleteModal(false);
      // Optional: show a toast notification here
    } catch (err) {
      alert(err.message || "Unknown error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div style={pageWrapper}>
      {/* Sticky header bar */}
      <div className="header-sticky-row">
        <div className="header-logo">
          <img
            src={logo}
            alt="SpHing Logo"
            style={{
              width: 210,
              height: "auto",
              display: "block"
            }}
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

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedSiteData && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: "#232629",
              borderRadius: 18,
              padding: "38px 36px 32px 36px",
              minWidth: 350,
              boxShadow: "0 4px 40px #000a",
              color: "#fff"
            }}
          >
            <h3 style={{ fontSize: 24, margin: 0, marginBottom: 14, fontWeight: 800 }}>Delete Site</h3>
            <p style={{ fontSize: 18, margin: "22px 0 32px 0" }}>
              Are you sure you want to delete <b>{selectedSiteData.site_name}</b>?
            </p>
            <div style={{ display: "flex", gap: 18, justifyContent: "right" }}>
              <button
                className="modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                style={{
                  background: "#3a3c3e",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 17,
                  borderRadius: 11,
                  border: "none",
                  padding: "8px 28px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s"
                }}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  background: "#e32840",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 17,
                  borderRadius: 11,
                  border: "none",
                  padding: "8px 28px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s"
                }}
              >
                {deleteLoading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Site content card */}
      <div style={cardStyle}>
        {/* Show delete button only when a site is selected */}
        {selectedSiteData && (
          <button
            style={deleteBtnStyle}
            onClick={() => setShowDeleteModal(true)}
            title="Delete Site"
          >
            {trashIcon}
          </button>
        )}

        <div style={cardTitle}>Edit Site</div>
        {loading ? (
          <div style={{ color: palette.text, fontSize: 20 }}>Loading site data…</div>
        ) : error ? (
          <div style={{ color: palette.red, fontSize: 20 }}>Error: {error}</div>
        ) : (
          <>
            <div style={labelStyle}>Choose site to edit:</div>
            <div style={{ width: "100%", marginBottom: 12 }}>
              <Select
                options={siteOptions}
                value={selectedOption}
                onChange={setSelectedOption}
                placeholder="Search or select site..."
                isSearchable
                styles={{
                  container: base => ({
                    ...base,
                    ...searchSelectStyle,
                  }),
                  control: base => ({
                    ...base,
                    background: palette.card,
                    color: palette.text,
                    border: "1.5px solid #393939",
                    boxShadow: "none",
                  }),
                  menu: base => ({
                    ...base,
                    background: palette.card,
                    color: palette.text,
                  }),
                  option: base => ({
                    ...base,
                    background: palette.card,
                    color: palette.text,
                    cursor: "pointer",
                  }),
                  input: base => ({
                    ...base,
                    color: palette.text,
                  }),
                  singleValue: base => ({
                    ...base,
                    color: palette.text,
                  }),
                  placeholder: base => ({
                    ...base,
                    color: "#888",
                  }),
                }}
              />
            </div>
            {selectedSiteData && (
              <EditSiteForm
                siteData={selectedSiteData}
                onSave={handleSave}
                loading={saveLoading}
              />
            )}
            {successMsg && (
              <div style={{ color: "#10B981", fontWeight: 600, marginTop: 8 }}>
                {successMsg}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
