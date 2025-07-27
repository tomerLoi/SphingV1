import React from "react";
import AddMemberForm from "../components/AddMemberForm/AddMemberForm";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/sphing_logo.png";
import "../assets/styles/addmember.css";

const AddMember = () => {
  const navigate = useNavigate();

  return (
    <div className="add-member-page">
      {/* Sticky header row: logo left, back button right */}
      <div className="header-sticky-row">
        <div className="header-logo">
          <img
            src={logo}
            alt="SpHing Logo"
            style={{
              width: 210,
              height: "auto",
              display: "block",
            }}
          />
        </div>
        <div className="header-actions">
          <button
            className="back-to-dashboard-btn"
            type="button"
            onClick={() => navigate("/team-members")}
          >
            &larr; Back to Members
          </button>
        </div>
      </div>
      {/* Form section */}
      <AddMemberForm onSuccess={() => navigate("/team-members")} />
    </div>
  );
};

export default AddMember;
