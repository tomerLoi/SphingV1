// src/components/MemberTable/MemberTable.jsx

import React, { useRef, useState } from "react";
import Select from "react-select";
import PortalMenu from "../PortalMenu/PortalMenu";
import { deleteMember, updateMember } from "../../api/members";
import "../../assets/styles/teammembers.css";

export default function MemberTable({ members, locations, onDataChanged }) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const buttonRefs = useRef({});

  // Open action menu for member
  const handleOpenMenu = (id) => {
    setMenuOpen(menuOpen === id ? null : id);
    const btn = buttonRefs.current[id];
    if (btn) setAnchorRect(btn.getBoundingClientRect());
  };

  const handleCloseMenu = () => setMenuOpen(null);

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
    setMenuOpen(null);
  };

  const handleEditClick = (member) => {
    setSelectedMember(member);

    // Normalize locations to an array of values
    let locArray = [];
    if (typeof member.locations === "string") {
      locArray = member.locations.split(",").map((loc) => loc.trim());
    } else if (Array.isArray(member.locations)) {
      // If locations are objects, extract their values (site_name or value)
      locArray = member.locations.map((loc) =>
        typeof loc === "object" && loc !== null
          ? loc.value || loc.site_name || loc.name || ""
          : loc
      );
    }

    setEditData({
      id: member.id || "",
      full_name: member.full_name || member.name || "",
      role: member.role || "Contact",
      email: member.email || "",
      phone: member.phone || "",
      locations: locArray,
    });
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      await deleteMember(selectedMember.id);
      setShowDeleteModal(false);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error("Failed to delete member:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const payload = {
        ...editData,
        // Send locations as a string (comma-separated), or adapt to backend structure
        locations: Array.isArray(editData.locations)
          ? editData.locations.join(", ")
          : editData.locations,
      };
      await updateMember(selectedMember.id, payload);
      setShowEditModal(false);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error("Failed to update member:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-table-wrapper">
      <table className="member-table rounded-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Locations</th>
            <th style={{ width: "50px" }}></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            // Display locations: support arrays of objects, strings, etc.
            const displayLocations = Array.isArray(member.locations)
              ? member.locations
                  .map((loc) => {
                    if (typeof loc === "string") return loc;
                    if (typeof loc === "object" && loc !== null) {
                      // Try site_name first, then name, else stringify
                      return loc.site_name || loc.name || JSON.stringify(loc);
                    }
                    return "";
                  })
                  .join(", ")
              : typeof member.locations === "string"
              ? member.locations
              : "";

            return (
              <tr key={member.id}>
                <td>{member.full_name || member.name}</td>
                <td>{member.role}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{displayLocations}</td>
                <td className="action-cell">
                  <button
                    className="action-btn"
                    ref={(el) => (buttonRefs.current[member.id] = el)}
                    onClick={() => handleOpenMenu(member.id)}
                  >
                    ⋯
                  </button>
                  {menuOpen === member.id && (
                    <PortalMenu anchorRect={anchorRect} open={true} onClose={handleCloseMenu}>
                      <button onClick={() => handleEditClick(member)}>Edit</button>
                      <button onClick={() => handleDeleteClick(member)}>Delete</button>
                    </PortalMenu>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Member</h3>
            <p>
              Are you sure you want to delete{" "}
              <b>{selectedMember?.full_name || selectedMember?.name}</b>?
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={confirmDelete} disabled={loading}>
                {loading ? "Deleting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Member</h3>
            <label>Name</label>
            <input
              type="text"
              value={editData.full_name || ""}
              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
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
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />

            <label>Phone</label>
            <input
              type="text"
              value={editData.phone || ""}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <label>Locations</label>
            <Select
              isMulti
              // Value must match option structure (usually value = id or name)
              value={locations.filter((loc) => editData.locations.includes(loc.value))}
              onChange={(selected) =>
                setEditData({ ...editData, locations: selected.map((opt) => opt.value) })
              }
              options={locations}
              className="react-select-container"
              classNamePrefix="react-select"
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

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={saveEdit} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
