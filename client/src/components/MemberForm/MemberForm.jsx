import React from "react";

/**
 * Reusable form component for adding or editing a team member.
 * Props:
 * - editData: The current data (object) of the member being edited.
 * - setEditData: Function to update form state.
 * - locations: List of available locations for dropdown.
 */
export default function MemberForm({ editData, setEditData, locations }) {
  return (
    <form className="member-form">
      <label>Name</label>
      <input
        type="text"
        value={editData.full_name || ""}
        onChange={(e) =>
          setEditData({ ...editData, full_name: e.target.value })
        }
      />

      <label>Role</label>
      <select
        value={editData.role}
        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
      >
        <option value="Contact">Contact</option>
        <option value="IT Member">IT Member</option>
      </select>

      <label>Email</label>
      <input
        type="email"
        value={editData.email || ""}
        onChange={(e) =>
          setEditData({ ...editData, email: e.target.value })
        }
      />

      <label>Phone</label>
      <input
        type="text"
        value={editData.phone || ""}
        onChange={(e) =>
          setEditData({ ...editData, phone: e.target.value })
        }
      />

      <label>Locations</label>
      <select
        multiple
        value={editData.locations || []}
        onChange={(e) =>
          setEditData({
            ...editData,
            locations: Array.from(e.target.selectedOptions, (opt) => opt.value),
          })
        }
      >
        {locations.map((loc, idx) => (
          <option key={idx} value={loc.name}>
            {loc.name}
          </option>
        ))}
      </select>
    </form>
  );
}
