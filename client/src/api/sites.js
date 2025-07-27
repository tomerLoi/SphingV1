
import CONFIG from "../config";

// client/src/api/sites.js

// API calls for Site management

// Create a new site (POST)
export async function createSite(data, token) {
  const response = await fetch(`${CONFIG.API_URL}/api/createsite/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    // Try to extract error message from server if available
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create site");
  }
  return await response.json();
}

// Get all sites (GET)
export async function getSites(token) {
  const response = await fetch("http://localhost:8000/api/sites/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sites");
  }
  return await response.json();
}

// Get single site by ID (GET)
export async function getSiteById(siteId, token) {
  const response = await fetch(`http://localhost:8000/api/sites/${siteId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch site details");
  }
  return await response.json();
}

// Update an existing site (PUT)
export async function updateSite(siteId, data, token) {
  const response = await fetch(`http://localhost:8000/api/sites/${siteId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update site");
  }
  return await response.json();
}
