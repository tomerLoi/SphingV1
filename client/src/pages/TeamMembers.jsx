// src/pages/TeamMembers.jsx

import React, { useEffect, useState } from "react";
import { getMembers } from "../api/members";
import MemberTable from "../components/MemberTable/MemberTable";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/teammembers.css";

const TeamMembers = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all members & locations
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getMembers();
      if (Array.isArray(data) && data.length > 0) {
        const allButLast = data.slice(0, -1); // All members (except locations object)
        const lastItem = data[data.length - 1]; // Locations object
        setMembers(allButLast);
        setFilteredMembers(allButLast);
        // Prepare dropdown options for locations
        if (lastItem.all_locations && Array.isArray(lastItem.all_locations)) {
          setLocations(
            lastItem.all_locations.map((loc) => ({
              value: loc.site_name,
              label: loc.site_name,
            }))
          );
        } else {
          setLocations([]);
        }
      } else {
        setMembers([]);
        setFilteredMembers([]);
        setLocations([]);
      }
    } catch {
      setMembers([]);
      setFilteredMembers([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter members by search input (case-insensitive)
  useEffect(() => {
    if (!search.trim()) {
      setFilteredMembers(members);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredMembers(
      members.filter((m) => {
        const name = String(m.full_name || "").toLowerCase();
        const email = String(m.email || "").toLowerCase();
        const phone = String(m.phone || "").toLowerCase();
        const locationsStr = Array.isArray(m.locations)
          ? m.locations.join(", ").toLowerCase()
          : String(m.locations || "").toLowerCase();
        const role = String(m.role || "").toLowerCase();
        return (
          name.includes(lower) ||
          email.includes(lower) ||
          phone.includes(lower) ||
          locationsStr.includes(lower) ||
          role.includes(lower)
        );
      })
    );
  }, [search, members]);

  return (
    <div className="team-members-page">
      {/* Sticky header with logo and back button */}
      <div className="header-sticky-row">
        <div className="header-logo">
          <img src={logo} alt="SpHing Logo" style={{ width: 210, height: "auto" }} />
        </div>
        <div className="header-actions">
          <button className="back-to-dashboard-btn" onClick={() => navigate("/dashboard")}>
            &larr; Back to Dashboard
          </button>
        </div>
      </div>

      {/* Page title, search, add member */}
      <div className="title-with-button center-mode">
        <input
          type="text"
          className="member-search-input"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <h1 className="header-title">Team Members</h1>
        <button className="add-member-btn circle-btn" onClick={() => navigate("/add-member")}>
          +
        </button>
      </div>

      {/* Members table or loading/empty states */}
      {loading ? (
        <div style={{ textAlign: "center", margin: "2rem" }}>Loading...</div>
      ) : filteredMembers.length === 0 ? (
        <div className="no-members-msg">
          No team members found.<br />
          Click <b>+ Add New Member</b> to add the first one!
        </div>
      ) : (
        <div className="table-wrapper">
          <MemberTable
            members={filteredMembers}
            locations={locations}
            onDataChanged={fetchMembers} // Will trigger a full refetch after edit/delete
          />
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
