import React from "react";
import SiteRow from "./SiteRow";

// השתמש בקלאסים של crowd! (תואם ל-css שלך)
export default function SiteList({ continent, sites }) {
  return (
    <div className="dashboard-continent">
      <div className="continent-title-crowd">{continent}</div>
      <div className="site-list-crowd">
        {sites && sites.length > 0 ? (
          sites.map((site) => (
            <SiteRow
              key={site.site_id}
              name={site.site_name}
              status={
                site.isps.every((isp) => isp.status === "offline")
                  ? "down"
                  : site.isps.some((isp) => isp.status === "offline")
                  ? "degraded"
                  : "ok"
              }
              isp1Status={site.isps[0]?.status || ""}
              isp1Name={site.isps[0]?.name || ""}
              isp1Ip={site.isps[0]?.ip || ""}
              isp2Status={site.isps[1]?.status || ""}
              isp2Name={site.isps[1]?.name || ""}
              isp2Ip={site.isps[1]?.ip || ""}
            />
          ))
        ) : (
          <div className="site-list-empty">No sites found.</div>
        )}
      </div>
    </div>
  );
}
