async function requestJson(url, options = {}, fallbackMessage = "Request failed") {
  const response = await fetch(url, options);
  const body = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(body?.message || `${fallbackMessage} (${response.status}).`);
  }
  if (!body) {
    throw new Error("The server returned an invalid response.");
  }
  return body;
}

export function getJobs(filters, { signal } = {}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.category && filters.category !== "All roles") {
    params.set("category", filters.category);
  }
  if (filters.workplace?.trim()) {
    params.set("workplace", filters.workplace.trim());
  }

  return requestJson(
    `/api/jobs?${params}`,
    { signal },
    "Could not load jobs",
  );
}

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

export function deleteImprovementPlan(id) {
  return requestJson(
    `/api/improvement-plans/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Could not delete improvement",
  );
}