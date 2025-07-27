// src/api/members.js
import CONFIG from "../config";

// Get all IT members
export async function getMembers() {
  const response = await fetch(`${CONFIG.API_URL}/api/it_members/`);
  if (!response.ok) throw new Error("Failed to fetch members");
  return await response.json();
}

// Create a new IT member
export async function createMember(data) {
  const response = await fetch(`${CONFIG.API_URL}/api/it_members/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create member");
  }
  return await response.json();
}

// Delete a member by ID
export async function deleteMember(id) {
  const res = await fetch(`${CONFIG.API_URL}/api/it_members/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete member");
  return true;
}

// Update a member by ID
export async function updateMember(id, data) {
  const res = await fetch(`${CONFIG.API_URL}/api/it_members/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return await res.json();
}

// Get all continents (for dropdowns etc.)
export async function getContinents() {
  const response = await fetch(`${CONFIG.API_URL}/api/continents/`);
  if (!response.ok) throw new Error("Failed to fetch continents");
  return await response.json();
}

// Get all locations (for multi-select etc.)
export async function getLocations() {
  const response = await fetch(`${CONFIG.API_URL}/api/locations/`);
  if (!response.ok) throw new Error("Failed to fetch locations");
  return await response.json();
}

// Get locations by continent name
export async function getLocationsByContinent(continent) {
  const url = `${CONFIG.API_URL}/api/locations/?continent=${encodeURIComponent(continent)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch locations by continent");
  return await response.json();
}
