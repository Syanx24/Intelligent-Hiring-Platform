import { requestJson } from "../apiClient.js";

export function getMyCompanyJobs({ signal } = {}) {
  return requestJson("/api/jobs/company/my-jobs", { signal }, "Could not load company jobs");
}

export function createCompanyJob(jobData) {
  return requestJson(
    "/api/jobs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    },
    "Could not create job listing",
  );
}

export function updateCompanyJob(id, jobData) {
  return requestJson(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    },
    "Could not update job listing",
  );
}

export function deleteCompanyJob(id) {
  return requestJson(
    `/api/jobs/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Could not delete job listing",
  );
}
