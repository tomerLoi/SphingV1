import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import logo from "../assets/images/sphing_logo.png";
import CONFIG from "../config";
import EditSiteForm from "../components/EditSiteForm/EditSiteForm";
import "../assets/styles/addmember.css"; // Reuse sticky header + button styling
import "../assets/styles/siteform.css";  // Keep for card or page-specific styling

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
  position: "relative", // נדרש כדי למקם את כפתור המחיקה בפנים
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

// עיצוב כפתור מחיקה
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

// אייקון פח אשפה לבן
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

  useEffect(() => {
    async function fetchSites() {
      setLoading(true);
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/sites/`);
        if (!res.ok) throw new Error("Failed to fetch sites data");
        const data = await res.json();

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

  const siteOptions = sitesData.map(site => ({
    value: site.site_id,
    label: `${site.site_name}${site.continent ? " (" + site.continent + ")" : ""}`,
  }));

  const selectedSiteData =
    selectedOption &&
    sitesData.find(s => String(s.site_id) === String(selectedOption.value));

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

  // פעולה למחיקת אתר
  async function handleDelete() {
    if (!selectedSiteData) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedSiteData.site_name}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${CONFIG.API_URL}/api/sites/${selectedSiteData.site_id}/`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete site");

      alert("Site deleted successfully!");
      setSitesData(prev => prev.filter(s => s.site_id !== selectedSiteData.site_id));
      setSelectedOption(null);
    } catch (err) {
      alert(err.message || "Unknown error");
    }
  }

  return (
    <div style={pageWrapper}>
      {/* Sticky header bar - same style as TeamMembers/AddSite */}
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

      {/* Edit Site content card */}
      <div style={cardStyle}>
        {/* כפתור מחיקה - יוצג רק אם נבחר אתר */}
        {selectedSiteData && (
          <button style={deleteBtnStyle} onClick={handleDelete} title="Delete Site">
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
