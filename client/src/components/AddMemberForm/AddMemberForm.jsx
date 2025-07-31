import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createMember, getLocations } from "../../api/members";
import "../../assets/styles/addmember.css";

const AddMemberForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    locations: [],
    email: "",
    role: "Contact",
    password: "",
  });
  const [locationsOptions, setLocationsOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch locations for dropdown
  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await getLocations();
        let arr = Array.isArray(data)
          ? data.map((loc) => ({
              value: loc.site_name,
              label: loc.site_name,
            }))
          : [];
        setLocationsOptions(arr);
      } catch (err) {
        setLocationsOptions([]);
        console.error("Failed to fetch locations", err);
      }
    }
    fetchLocations();
  }, []);

  // Password generator for IT Member
  const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling for role switch
    if (name === "role" && value === "IT Member") {
      setForm((prev) => ({
        ...prev,
        role: value,
        locations: ["All"], // <-- Auto-select All and lock!
        password: generatePassword(),
      }));
    } else if (name === "role" && value === "Contact") {
      setForm((prev) => ({
        ...prev,
        role: value,
        locations: [],
        password: "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Multi-select handler (will be ignored if disabled)
  const handleLocationsChange = (selected) => {
    setForm((prev) => ({
      ...prev,
      locations: selected ? selected.map((opt) => opt.value) : [],
    }));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        location: form.locations.join(", "),
      };
      delete payload.locations;
      if (payload.role === "Contact") delete payload.password;
      await createMember(payload);
      setForm({
        full_name: "",
        phone: "",
        locations: [],
        email: "",
        role: "Contact",
        password: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  // Get value for react-select according to current role
  const selectValue =
    form.role === "IT Member"
      ? [{ value: "All", label: "All" }]
      : locationsOptions.filter((opt) => form.locations.includes(opt.value));

  return (
    <form className="add-member-form" onSubmit={handleSubmit} autoComplete="off">
      <h2>Create a New Member</h2>

      <label htmlFor="full_name">Full Name</label>
      <input
        type="text"
        id="full_name"
        name="full_name"
        placeholder="Enter full name"
        value={form.full_name}
        onChange={handleChange}
        required
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter email"
        value={form.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="phone">Phone</label>
      <input
        type="text"
        id="phone"
        name="phone"
        placeholder="Enter phone"
        value={form.phone}
        onChange={handleChange}
        required
      />

      {/* Multi-select locations */}
      <label htmlFor="locations">Locations</label>
      <Select
        id="locations"
        isMulti
        options={form.role === "IT Member"
          ? [{ value: "All", label: "All" }]
          : locationsOptions}
        value={selectValue}
        onChange={handleLocationsChange}
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select locations..."
        required
        isDisabled={form.role === "IT Member"} // <--- lock when IT Member!
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#1b1b1b",
            borderColor: "#444",
            borderRadius: "6px",
            color: "#fff",
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#2c2c2c",
          }),
          input: (base) => ({
            ...base,
            color: "#fff",
          }),
        }}
      />

      <label htmlFor="role">Role</label>
      <select
        id="role"
        name="role"
        value={form.role}
        onChange={handleChange}
        className="role-select"
      >
        <option value="Contact">Contact</option>
        <option value="IT Member">IT Member</option>
      </select>

      {/* Password for IT Member */}
      {form.role === "IT Member" && (
        <>
          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            name="password"
            placeholder="Generated password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </>
      )}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Member"}
      </button>
    </form>
  );
};

export default AddMemberForm;
