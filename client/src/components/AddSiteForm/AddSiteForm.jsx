import React, { useState, useEffect } from "react";
import { createSite } from "../../api/sites";
import CONFIG from "../../config";

// Color palette for the form
const palette = {
  background: "#181A1B",
  card: "#232629",
  red: "#E71D32",
  redLight: "#FF3535",
  green: "#16C784",
  orange: "#FFA500",
  border: "#36383B",
  text: "#FFFFFF",
  textSecondary: "#BFC2C5",
};

function AddSiteForm({ onSuccess }) {
  const [siteName, setSiteName] = useState("");
  const [continent, setContinent] = useState("");
  const [continents, setContinents] = useState([]);
  const [isp1Name, setIsp1Name] = useState("");
  const [isp1Ip, setIsp1Ip] = useState("");
  const [isp2Name, setIsp2Name] = useState("");
  const [isp2Ip, setIsp2Ip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch continents list from API on mount
  useEffect(() => {
    async function fetchContinents() {
      try {
        const res = await fetch(`${CONFIG.API_URL}/api/continents/`);
        if (!res.ok) throw new Error("Failed to fetch continents");
        const data = await res.json();
        setContinents(data);
      } catch (err) {
        setContinents([]);
      }
    }
    fetchContinents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteName || !continent || !isp1Name || !isp1Ip) {
      setError("Please fill all required fields (Site + ISP 1).");
      return;
    }
    setLoading(true);
    setError(null);
    const isps = [{ name: isp1Name, ip: isp1Ip }];
    if (isp2Name && isp2Ip) {
      isps.push({ name: isp2Name, ip: isp2Ip });
    }
    try {
      await createSite(
        {
          name: siteName,
          continent,
          isps,
        },
        null // Or pass token if needed
      );
      setLoading(false);
      if (onSuccess) onSuccess();
      setSiteName("");
      setContinent("");
      setIsp1Name("");
      setIsp1Ip("");
      setIsp2Name("");
      setIsp2Ip("");
    } catch (err) {
      setLoading(false);
      setError("Server error, please try again.");
    }
  };

  return (
    <div style={{
      background: palette.card,
      borderRadius: 16,
      padding: 36,
      maxWidth: 500,
      width: "100%",
      boxShadow: "0 2px 16px rgba(0,0,0,0.32)"
    }}>
      <h1 style={{
        color: palette.text,
        fontSize: 28,
        fontWeight: 700,
        marginBottom: 8,
        textAlign: "center"
      }}>Add New Site</h1>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Site Name
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            style={inputStyle}
            autoFocus
            required
          />
        </label>
        <label style={labelStyle}>Continent
          <select
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            style={{
              ...inputStyle,
              color: continent ? palette.text : palette.textSecondary
            }}
            required
          >
            <option value="">Select a continent</option>
            {/* 
              If continent objects look like { continent_name: "Europe" }
              Always use the key (string) for value & label 
            */}
            {continents.map((c, idx) => (
              <option key={c.continent_name || idx} value={c.continent_name || c}>
                {c.continent_name || c}
              </option>
            ))}
          </select>
        </label>
        <div style={{
          margin: "20px 0 8px",
          color: palette.text,
          fontWeight: 700,
          fontSize: 18
        }}>ISP Configuration</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ISP 1 Name
              <input
                type="text"
                value={isp1Name}
                onChange={(e) => setIsp1Name(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ISP 1 IP
              <input
                type="text"
                value={isp1Ip}
                onChange={(e) => setIsp1Ip(e.target.value)}
                style={inputStyle}
                required
              />
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ISP 2 Name
              <input
                type="text"
                value={isp2Name}
                onChange={(e) => setIsp2Name(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ISP 2 IP
              <input
                type="text"
                value={isp2Ip}
                onChange={(e) => setIsp2Ip(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>
        {error && (
          <div style={{
            margin: "16px 0 0",
            color: palette.red,
            fontWeight: 600,
            textAlign: "center"
          }}>{error}</div>
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
          {loading ? "Adding..." : "Create Site"}
        </button>
      </form>
    </div>
  );
}

// Input style for all text/select inputs
const inputStyle = {
  width: "100%",
  margin: "6px 0 18px 0",
  padding: "10px 12px",
  background: "#181A1B",
  border: `1.5px solid #36383B`,
  borderRadius: 7,
  color: "#FFFFFF",
  fontSize: 16,
  outline: "none",
};

// Label style for each form field
const labelStyle = {
  color: "#BFC2C5",
  fontWeight: 500,
  fontSize: 15,
  display: "block",
};

export default AddSiteForm;
