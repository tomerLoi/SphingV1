// src/api/alerts.js
import CONFIG from "../config";

// Get all alerts from backend
export async function getAlerts() {
  const response = await fetch(`${CONFIG.API_URL}/api/alerts/`);
  if (!response.ok) throw new Error("Failed to fetch alerts");
  return await response.json();
}
