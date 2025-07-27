import React, { useState, useEffect } from "react";

const palette = {
  background: "#181A1B",
  card: "#232629",
  red: "#E71D32",
  green: "#16C784",
  border: "#36383B",
  text: "#FFFFFF",
  textSecondary: "#BFC2C5",
};

const inputStyle = {
  width: "100%",
  margin: "6px 0 18px 0",
  padding: "10px 12px",
  background: "#181A1B",
  border: `1.5px solid ${palette.border}`,
  borderRadius: 7,
  color: palette.text,
  fontSize: 16,
  outline: "none",
};

const labelStyle = {
  color: palette.textSecondary,
  fontWeight: 500,
  fontSize: 15,
  display: "block",
};

export default function EditSiteForm({ siteData, onSave, loading }) {
  const [siteName, setSiteName] = useState(siteData.site_name || "");
  const [continent, setContinent] = useState(siteData.continent || "");
  const [isps, setIsps] = useState(
    siteData.isps && siteData.isps.length > 0
      ? siteData.isps.map(i => ({ ...i }))
      : [
          { name: "", ip: "" },
          { name: "", ip: "" }
        ]
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    setSiteName(siteData.site_name || "");
    setContinent(siteData.continent || "");
    setIsps(
      siteData.isps && siteData.isps.length > 0
        ? siteData.isps.map(i => ({ ...i }))
        : [
            { name: "", ip: "" },
            { name: "", ip: "" }
          ]
    );
    setError(null);
  }, [siteData]);

  function handleIspChange(index, key, value) {
    setIsps(prev =>
      prev.map((isp, idx) =>
        idx === index ? { ...isp, [key]: value } : isp
      )
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!siteName || !continent || !isps[0].name || !isps[0].ip) {
      setError("Please fill all required fields (Site, Continent, ISP 1).");
      return;
    }
    setError(null);
    onSave({
      ...siteData,
      site_name: siteName,
      continent,
      isps: isps
    });
  }

  return (
    <div
      style={{
        background: palette.card,
        borderRadius: 16,
        padding: 36,
        maxWidth: 500,
        width: "100%",
        boxShadow: "0 2px 16px rgba(0,0,0,0.32)",
        margin: "0 auto"
      }}
    >
      <h1
        style={{
          color: palette.text,
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 8,
          textAlign: "center"
        }}
      >
        Edit Site
      </h1>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          Site Name
          <input
            type="text"
            value={siteName}
            onChange={e => setSiteName(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          Continent
          <input
            type="text"
            value={continent}
            onChange={e => setContinent(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <div
          style={{
            margin: "20px 0 8px",
            color: palette.text,
            fontWeight: 700,
            fontSize: 18
          }}
        >
          ISP Configuration
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              ISP 1 Name
              <input
                type="text"
                value={isps[0]?.name || ""}
                onChange={e => handleIspChange(0, "name", e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              ISP 1 IP
              <input
                type="text"
                value={isps[0]?.ip || ""}
                onChange={e => handleIspChange(0, "ip", e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              ISP 2 Name
              <input
                type="text"
                value={isps[1]?.name || ""}
                onChange={e => handleIspChange(1, "name", e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              ISP 2 IP
              <input
                type="text"
                value={isps[1]?.ip || ""}
                onChange={e => handleIspChange(1, "ip", e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>
        {error && (
          <div
            style={{
              margin: "16px 0 0",
              color: palette.red,
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: palette.red,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 18,
            marginTop: 24,
            padding: "12px 0",
            cursor: loading ? "wait" : "pointer",
            transition: "background 0.15s"
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
