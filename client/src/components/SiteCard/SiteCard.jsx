import React from "react";

export default function SiteCard({ name, isp1Status, isp2Status }) {
  // isp1Status/isp2Status: "online" | "offline" | "degraded"
  const getStatusColor = (stat) => {
    if (stat === "online") return "#16C784";
    if (stat === "offline") return "#E71D32";
    if (stat === "degraded") return "#FFA500";
    return "#BFC2C5";
  };

  return (
    <div className="site-card-navbar">
      <span className="site-name-navbar">{name}</span>
      <span className="isp-dot-navbar" style={{ background: getStatusColor(isp1Status) }}></span>
      <span className="isp-dot-navbar" style={{ background: getStatusColor(isp2Status) }}></span>
    </div>
  );
}
