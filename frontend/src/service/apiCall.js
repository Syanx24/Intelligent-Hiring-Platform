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
    // Ignore storage issues
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    // Ignore storage issues
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

async function requestJson(url, options = {}, fallbackMessage = "Request failed") {
  const token = getStoredToken();
  const headers = {
    ...options.headers,
  };

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
    throw new Error(body?.message || `${fallbackMessage} (${response.status}).`);
  }
  if (!body) {
    throw new Error("The server returned an invalid response.");
  }
  return body;
}

/* ==========================================================================
   AUTHENTICATION APIS
   ========================================================================== */

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
  if (data.token) {
    setStoredAuth(data.token, data.user);
  }
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
  if (data.token) {
    setStoredAuth(data.token, data.user);
  }
  return data;
}

export async function getCurrentUser({ signal } = {}) {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const user = await requestJson(
      "/api/auth/me",
      { signal },
      "Session verification failed",
    );
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
  if (data.user) {
    setStoredAuth(getStoredToken(), data.user);
  }
  return data.user;
}

/* ==========================================================================
   PUBLIC & CANDIDATE JOBS & APPLICATIONS
   ========================================================================== */

export function getJobs(filters = {}, { signal } = {}) {
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

<<<<<<< HEAD
export function authenticate({ mode, name, email, password }) {
  return requestJson(
    `/api/auth/${mode}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    },
    mode === "signup" ? "Could not create account" : "Could not sign in",
  );
}

=======
export function getMyApplications({ signal } = {}) {
  return requestJson(
    "/api/applications/candidate/my-applications",
    { signal },
    "Could not load your applications",
  );
}

/* ==========================================================================
   COMPANY SPECIFIC APIS (POST, EDIT, DELETE, APPLICANTS)
   ========================================================================== */

export function getMyCompanyJobs({ signal } = {}) {
  return requestJson(
    "/api/jobs/company/my-jobs",
    { signal },
    "Could not load company jobs",
  );
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

/* ==========================================================================
   ROADMAP IMPROVEMENTS APIS
   ========================================================================== */

>>>>>>> 6834664409879107c2dc6f9f76c1a2666e990a93
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
