// client/src/components/PingStatus/PingStatus.jsx

import React from "react";
import ReactTooltip from "react-tooltip";
import "./PingStatus.css"; // תוכל לאחד עם dashboard.css אם תרצה

/**
 * props:
 *   ispName: string
 *   ip: string
 *   status: "ok" | "down" | "warning"
 */
const statusColors = {
  ok: "green",
  warning: "orange",
  down: "red"
};

export default function PingStatus({ ispName, ip, status }) {
  const color = statusColors[status] || "gray";
  const tooltipId = `${ispName}-${ip}`;

  return (
    <>
      <span
        className={`ping-dot ${color}`}
        data-tip
        data-for={tooltipId}
        tabIndex={0}
        aria-label={`${ispName} ${ip} status`} // נגישות
      />
      <ReactTooltip
        id={tooltipId}
        place="top"
        effect="solid"
        className="ping-tooltip"
      >
        <div><b>ISP:</b> {ispName}</div>
        <div><b>IP:</b> {ip}</div>
      </ReactTooltip>
    </>
  );
}
