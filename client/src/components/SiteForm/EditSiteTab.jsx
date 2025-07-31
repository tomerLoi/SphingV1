// src/components/SiteForm/EditSiteTab.jsx

import React, { useEffect, useState } from "react";
import Select from "react-select";
import EditSiteForm from "../EditSiteForm/EditSiteForm";
import CONFIG from "../../config";

const palette = {
  card: "#232629",
  red: "#E71D32",
  text: "#FFFFFF",
};

export default function EditSiteTab({ onSuccess }) {
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
      if (onSuccess) onSuccess("Site updated successfully!");
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
    } catch (err) {
      alert(err.message || "Unknown error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Delete confirmation modal */}
      {showDeleteModal && selectedSiteData && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: palette.card,
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
                  background: palette.red,
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

      <div style={{
        background: "#232629",
        borderRadius: 16,
        padding: 48,
        maxWidth: 650,
        minWidth: 420,
        width: "100%",
        boxShadow: "0 2px 16px rgba(0,0,0,0.32)",
        margin: "0 auto",
        marginTop: "0px",
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: "#fff" }}>Edit Site</div>
        {loading ? (
          <div style={{ color: palette.text, fontSize: 20 }}>Loading site data…</div>
        ) : error ? (
          <div style={{ color: palette.red, fontSize: 20 }}>Error: {error}</div>
        ) : (
          <>
            {/* Dropdown to select site */}
            <div style={{ marginBottom: 12 }}>
            <Select
            options={siteOptions}
            value={selectedOption}
            onChange={setSelectedOption}
            placeholder="Search or select site..."
            isSearchable
            styles={{
                container: base => ({
                ...base,
                width: "100%",
                fontSize: 17,
                color: palette.text,
                }),
                control: base => ({
                ...base,
                background: palette.card,
                color: palette.text,
                border: `1.5px solid ${selectedOption ? "#393939" : palette.red}`,
                boxShadow: "none",
                transition: "border 0.15s"
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
            {/* Always show EditSiteForm, pass null if no site selected */}
            <EditSiteForm
              siteData={selectedSiteData || null}
              onSave={handleSave}
              loading={saveLoading}
              disabled={!selectedSiteData}
              onDelete={() => setShowDeleteModal(true)}
            />
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
