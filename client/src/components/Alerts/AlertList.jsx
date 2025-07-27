import React from "react";

export default function AlertList() {
  const alerts = [
    { message: "Berlin HQ ISP1 is down", time: "12:00" },
    { message: "Munich ISP2 is down", time: "12:03" }
  ];

  return (
    <div className="alert-list-navbar">
      {alerts.map((alert, i) => (
        <div className="alert-item-navbar" key={i}>
          <span className="alert-time-navbar">{alert.time}</span>
          <span className="alert-message-navbar">{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
