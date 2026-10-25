import { requestJson } from "../apiClient.js";

export function getImprovementPlans({ signal } = {}) {
  return requestJson(
    "/api/improvement-plans",
    { signal },
    "Could not load improvements",
  );
}

export function createImprovementPlan(title) {
  return requestJson(
    "/api/improvement-plans",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
    "Could not add improvement",
  );
}

export function updateImprovementPlan(id, completed) {
  return requestJson(
    `/api/improvement-plans/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    },
    "Could not update improvement",
  );
}

