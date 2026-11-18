import { requestJson } from "./apiClient.js";

export function verifyAboutImagesAdmin(password) {
  return requestJson(
    "/api/about/images/admin/verify",
    { method: "POST", headers: { "X-About-Admin-Password": password } },
    "Could not verify admin password",
  );
}

export function getAboutImages({ signal } = {}) {
  return requestJson("/api/about/images", { signal }, "Could not load About Us images");
}

export function uploadAboutImage({ kind, memberId, fileName, fileData, password }) {
  return requestJson(
    "/api/about/images",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-About-Admin-Password": password,
      },
      body: JSON.stringify({ kind, memberId, fileName, fileData }),
    },
    "Could not upload About Us image",
  );
}

export function deleteAboutImage({ imageId, password }) {
  return requestJson(
    `/api/about/images/${encodeURIComponent(imageId)}`,
    {
      method: "DELETE",
      headers: { "X-About-Admin-Password": password },
    },
    "Could not delete About Us image",
  );
}
