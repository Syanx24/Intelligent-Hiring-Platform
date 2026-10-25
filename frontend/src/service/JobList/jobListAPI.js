import { requestJson } from "../apiClient.js";

export function getJobs(filters = {}, { signal } = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.category && filters.category !== "All roles") {
    params.set("category", filters.category);
  }
  if (filters.workplace?.trim()) params.set("workplace", filters.workplace.trim());

  return requestJson(`/api/jobs?${params}`, { signal }, "Could not load jobs");
}
