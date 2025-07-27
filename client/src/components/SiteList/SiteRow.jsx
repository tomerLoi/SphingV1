import React, { useState } from "react";
import { Tooltip } from "react-tooltip";

export default function SiteRow({
  name = "",
  status = "",
  isp1Status = "",
  isp2Status = "",
  isp1Name = "",
  isp1Ip = "",
  isp2Name = "",
  isp2Ip = "",
}) {
  const safeName = name || "";
  const tipId1 = `tip-${safeName.replace(/\s/g, "")}-isp1`;
  const tipId2 = `tip-${safeName.replace(/\s/g, "")}-isp2`;

  const [copiedMessage, setCopiedMessage] = useState("");

  // Copy IP to clipboard and show a temporary popup
  const copyIp = (ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip).then(() => {
      setCopiedMessage(`Copied ${ip}`);
      setTimeout(() => setCopiedMessage(""), 1500); // Hide after 1.5s
    });
  };

  // Render a dot (clickable for copy)
  const dot = (stat, tipId, ip) => (
    <span
      className="dot-crowd"
      data-tooltip-id={tipId}
      tabIndex={0}
      aria-label="ISP status"
      onClick={() => copyIp(ip)}
      style={{
        background: stat === "online" ? "var(--status-green)" : "var(--status-red)",
        cursor: "pointer",
      }}
    />
  );

  return (
    <div
      className={
        "site-row" +
        (status === "down"
          ? " critical"
          : status === "degraded"
          ? " warn"
          : "")
      }
      style={{ position: "relative" }}
    >
      <span className="site-name">{safeName}</span>
      <span className="site-dots">
        {dot(isp1Status, tipId1, isp1Ip)}
        {dot(isp2Status, tipId2, isp2Ip)}

        <Tooltip
          id={tipId1}
          place="top"
          className="ping-tooltip"
          content={
            <div>
              <div>
                <b>ISP:</b> {isp1Name}
              </div>
              <div>
                <b>IP:</b> {isp1Ip}
              </div>
              <small>(Click to copy)</small>
            </div>
          }
        />
        <Tooltip
          id={tipId2}
          place="top"
          className="ping-tooltip"
          content={
            <div>
              <div>
                <b>ISP:</b> {isp2Name}
              </div>
              <div>
                <b>IP:</b> {isp2Ip}
              </div>
              <small>(Click to copy)</small>
            </div>
          }
        />
      </span>

      {/* Small popup notification */}
      {copiedMessage && (
        <div className="copy-popup">
          {copiedMessage}
        </div>
      )}
    </div>
  );
}
