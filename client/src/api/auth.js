// src/utils/auth.js

// אפשרות: לבדוק expiration מקומית (אם רוצים)
export function isTokenValid() {
  const token = localStorage.getItem("auth_token");
  if (!token) return false;

  // Simple decode (לא הכי מאובטח! אבל מספיק לזיהוי exp)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      return false; // פג תוקף
    }
    return true;
  } catch {
    return false;
  }
}
