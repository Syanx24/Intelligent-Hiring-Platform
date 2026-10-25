import { getStoredToken, requestJson, setStoredAuth } from "../apiClient.js";

export async function uploadCandidateResume({ fileName, fileData }) {
  const data = await requestJson(
    "/api/auth/upload-resume",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileData }),
    },
    "Could not upload CV",
  );
  if (data.user) setStoredAuth(getStoredToken(), data.user);
  return data;
}
