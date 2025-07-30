// src/api/profile.js

import CONFIG from "../config";

/**
 * Get the current user's profile details from the API.
 * @returns {Promise<Object>} User profile object.
 */
export async function getProfile() {
  const token = sessionStorage.getItem("auth_token");
  const res = await fetch(`${CONFIG.API_URL}/api/profile/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return await res.json();
}

/**
 * Update the user's profile.
 * Accepts: { full_name, phone, locations, password }
 * Only sends password if the user entered it.
 * @param {Object} data - Profile fields to update.
 * @returns {Promise<Object>} Updated user profile object.
 */
export async function updateProfile(data) {
  const token = sessionStorage.getItem("auth_token");
  const res = await fetch(`${CONFIG.API_URL}/api/profile/`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return await res.json();
}
