import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/addmember.css";
import "../assets/styles/siteform.css";
import { getProfile, updateProfile } from "../api/profile";
import { getLocations } from "../api/members"; // Note: using from members.js as בפרויקט שלך

export default function ProfilePage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    locations: [],
    password: "",
  });
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Custom styles for react-select (dark theme)
  const selectDarkStyles = {
    control: (base, state) => ({
      ...base,
      background: "#181A1B",
      color: "#fff",
      borderColor: state.isFocused ? "#e32840" : "#36383B",
      borderRadius: 7,
      boxShadow: "none",
      minHeight: 44,
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
    }),
    menu: (base) => ({
      ...base,
      background: "#232629",
      color: "#fff",
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      background: "#292B2E",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? "#33383b" : "#232629",
      color: "#fff",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#999",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
  };

  // Load user profile and all locations from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch all locations for dropdown
        const locationsList = await getLocations();
        setAllLocations(
          locationsList.map((loc) => ({
            value: loc.id,
            label: loc.name,
          }))
        );

        // Fetch user profile details
        const data = await getProfile();
        setForm({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "",
          locations: Array.isArray(data.locations)
            ? data.locations.map((loc) => ({
                value: loc.id,
                label: loc.name,
              }))
            : [],
          password: "",
        });
      } catch (e) {
        setError("Failed to load profile.");
        // For debugging:
        // console.error("Profile or locations error", e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handle basic input fields
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle locations multi-select
  const handleLocationsChange = (selectedOptions) => {
    setForm((prev) => ({
      ...prev,
      locations: selectedOptions || [],
    }));
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setError("");
    try {
      // Prepare the update payload
      const updatePayload = {
        full_name: form.full_name,
        phone: form.phone,
        locations: form.locations.map((loc) => loc.value),
      };
      if (form.password && form.password.length > 0) {
        updatePayload.password = form.password;
      }

      await updateProfile(updatePayload);
      setSuccessMsg("Profile updated!");
    } catch (e) {
      setError("Failed to update profile.");
      // console.error("Update error", e);
    }
    setSaving(false);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="add-site-page">
      <div className="header-sticky-row">
        <div className="header-logo">
          <img
            src={logo}
            alt="SpHing Logo"
            style={{ width: 210, height: "auto", display: "block" }}
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
      <div className="site-form-wrapper">
        <div
          style={{
            background: "#232629",
            borderRadius: 16,
            padding: 36,
            maxWidth: 500,
            width: "100%",
            boxShadow: "0 2px 16px rgba(0,0,0,0.32)",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            My Profile
          </h1>
          {loading ? (
            <div style={{ color: "#fff", textAlign: "center" }}>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <label style={labelStyle}>
                Full Name
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  style={inputStyle}
                  autoFocus
                  required
                />
              </label>
              {/* Email (readonly) */}
              <label style={labelStyle}>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  style={inputStyle}
                  disabled
                />
              </label>
              {/* Phone */}
              <label style={labelStyle}>
                Phone
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </label>
              {/* Locations - multi select dropdown */}
              <label style={labelStyle}>
                Locations
                <Select
                  isMulti
                  isSearchable
                  name="locations"
                  value={form.locations}
                  onChange={handleLocationsChange}
                  options={allLocations}
                  placeholder="Select locations..."
                  styles={selectDarkStyles}
                  noOptionsMessage={() => "No locations found"}
                />
              </label>
              {/* Role (readonly) */}
              <label style={labelStyle}>
                Role
                <input
                  type="text"
                  name="role"
                  value={form.role}
                  style={inputStyle}
                  disabled
                />
              </label>
              {/* Password with show/hide */}
              <label style={labelStyle}>
                Password
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    style={inputStyle}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep unchanged"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "43%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      borderLeft: "none",
                      color: "#e32840",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      lineHeight: 1,
                    }}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye icon (visible)
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#e32840" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="12" rx="8" ry="5" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    ) : (
                      // Eye-off icon (hidden)
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#e32840" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="12" rx="8" ry="5" />
                        <circle cx="12" cy="12" r="2.5" />
                        <line x1="4" y1="20" x2="20" y2="4" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>
              {/* Error/success messages */}
              {error && <div style={errorStyle}>{error}</div>}
              {successMsg && <div style={successStyle}>{successMsg}</div>}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  background: "#e32840",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 24,
                  padding: "12px 0",
                  cursor: saving ? "wait" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline styles for form fields
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
const labelStyle = {
  color: "#BFC2C5",
  fontWeight: 500,
  fontSize: 15,
  display: "block",
};
const errorStyle = {
  color: "#E71D32",
  fontWeight: 600,
  textAlign: "center",
  margin: "16px 0 0",
};
const successStyle = {
  color: "#16C784",
  fontWeight: 700,
  textAlign: "center",
  margin: "16px 0 0",
};
