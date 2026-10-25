import {
  clearStoredAuth,
  getStoredToken,
  requestJson,
  setStoredAuth,
} from "./apiClient.js";

export async function registerUser(credentials) {
  const data = await requestJson(
    "/api/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    },
    "Registration failed",
  );
  if (data.token) setStoredAuth(data.token, data.user);
  return data;
}

export async function loginUser(credentials) {
  const data = await requestJson(
    "/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    },
    "Login failed",
  );
  if (data.token) setStoredAuth(data.token, data.user);
  return data;
}

export async function getCurrentUser({ signal } = {}) {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const user = await requestJson("/api/auth/me", { signal }, "Session verification failed");
    setStoredAuth(token, user);
    return user;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export async function updateUserProfile(profileData) {
  const data = await requestJson(
    "/api/auth/profile",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    },
    "Could not update profile",
  );
  if (data.user) setStoredAuth(getStoredToken(), data.user);
  return data.user;
}
