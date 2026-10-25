const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

export function getStoredToken() {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

export function setStoredAuth(token, user) {
  try {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // Ignore unavailable browser storage.
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function requestJson(url, options = {}, fallbackMessage = "Request failed") {
  const headers = { ...options.headers };
  const token = getStoredToken();

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  const body = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(body?.message || `${fallbackMessage} (${response.status}).`);
    if (Array.isArray(body?.errors)) error.errors = body.errors;
    throw error;
  }
  if (!body) throw new Error("The server returned an invalid response.");
  return body;
}
