import { requestJson } from "../apiClient.js";

export function submitApplication(application) {
  return requestJson(
    "/api/applications",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application),
    },
    "Could not submit application",
  );
}

export function getMyApplications({ signal } = {}) {
  return requestJson(
    "/api/applications/candidate/my-applications",
    { signal },
    "Could not load your applications",
  );
}

export function getJobApplicants(jobId, { signal } = {}) {
  return requestJson(
    `/api/applications/company/job/${encodeURIComponent(jobId)}`,
    { signal },
    "Could not load applicants",
  );
}

export function updateApplicationStatus(applicationId, status) {
  return requestJson(
    `/api/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    "Could not update application status",
  );
}
