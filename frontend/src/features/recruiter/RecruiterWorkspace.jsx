import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Check,
  ChevronRight,
  ListChecks,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  getCompanyApplications,
  updateApplicationStatus,
} from "../../service/application/jobApplicationAPI.js";
import {
  RecruiterFilter as FilterMenu,
  RecruiterSearch as SearchBox,
} from "../../components/recruiter/RecruiterControls.jsx";
import { updateCompanyJob } from "../../service/recruiter/recruiterAPI.js";
import GitHubSummaryCard from "../../components/GitHubSummaryCard.jsx";
import SidebarRecruiter from "../../components/recruiter/SidebarRecruiter.jsx";
import { CiEdit } from "react-icons/ci";
import { AiTwotoneDelete } from "react-icons/ai";
import { FaDoorOpen, FaDoorClosed } from "react-icons/fa";

const palette = ["#6f61ee", "#33b69a", "#f2a84a", "#e87587", "#84a8ef"];
const statusColors = {
  Applied: "#6f61ee",
  "Under review": "#f2a84a",
  Shortlisted: "#33b69a",
  Interviewing: "#84a8ef",
  Accepted: "#33b69a",
  Rejected: "#e87587",
};
const val = (n) => Number(n || 0);
const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

function StatusPill({ status }) {
  return (
    <span
      className="rw-status"
      style={{
        color: statusColors[status] || "#777",
        background: `${statusColors[status] || "#777"}18`,
      }}
    >
      <i style={{ background: statusColors[status] || "#777" }} />
      {status}
    </span>
  );
}

function Dashboard({ jobs, apps, onNavigate }) {
  const counts = [
    "Applied",
    "Under review",
    "Shortlisted",
    "Interviewing",
    "Rejected",
  ].map((name) => ({
    name,
    value: apps.filter((a) => a.status === name).length,
  }));
  const total = apps.length || 1;
  let cursor = 0;
  const donut = counts
    .map((x, i) => {
      const start = cursor;
      cursor += (x.value / total) * 100;
      return `${palette[i]} ${start}% ${cursor}%`;
    })
    .join(", ");
  const skillMap = {};
  apps.forEach((a) =>
    (a.candidateUser?.skills || []).forEach(
      (s) => (skillMap[s] = (skillMap[s] || 0) + 1),
    ),
  );
  const skills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxSkill = Math.max(1, ...skills.map((x) => x[1]));
  const depts = {};
  apps.forEach((a) => {
    const d = a.job?.category || "Other";
    depts[d] = (depts[d] || 0) + 1;
  });
  const departments = Object.entries(depts).slice(0, 5);
  const maxDept = Math.max(1, ...departments.map((x) => x[1]));
  return (
    <>
      <div className="rw-heading">
        <div>
          <div className="rw-eyebrow">RECRUITER OVERVIEW</div>
          <h1>Good morning, let’s hire well.</h1>
          <p>Here’s what’s happening across your hiring pipeline.</p>
        </div>
        <button className="rw-primary" onClick={() => onNavigate("My Jobs")}>
          Manage jobs <ChevronRight size={16} />
        </button>
      </div>
      <div className="rw-kpis">
        {[
          [
            "Open roles",
            jobs.filter((j) => j.status !== "Closed").length,
            Briefcase,
          ],
          ["Applications", apps.length, Users],
          [
            "Shortlisted",
            apps.filter((a) => a.status === "Shortlisted").length,
            ListChecks,
          ],
          [
            "In review",
            apps.filter((a) => a.status === "Under review").length,
            Activity,
          ],
        ].map(([l, n, I], i) => (
          <div className="rw-kpi" key={l}>
            <span className={`rw-kpi-icon tint-${i}`}>
              <I size={18} />
            </span>
            <span>{l}</span>
            <b>{n}</b>
            <small>
              {i === 0
                ? "Currently accepting applications"
                : "Across all open roles"}
            </small>
          </div>
        ))}
      </div>
      <div className="rw-chart-grid">
        <section className="rw-card rw-pipeline">
          <div className="rw-card-head">
            <div>
              <h2>Application pipeline</h2>
              <p>Current candidate status breakdown</p>
            </div>
            <span className="rw-soft-label">All time</span>
          </div>
          <div className="rw-donut-row">
            <div
              className="rw-donut"
              style={{ background: `conic-gradient(${donut})` }}
            >
              <div>
                <b>{apps.length}</b>
                <small>Applicants</small>
              </div>
            </div>
            <div className="rw-legend">
              {counts.map((c, i) => (
                <div key={c.name}>
                  <i style={{ background: palette[i] }} />
                  <span>{c.name}</span>
                  <b>{c.value}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rw-card">
          <div className="rw-card-head">
            <div>
              <h2>Top skills</h2>
              <p>Skills appearing across applicants</p>
            </div>
            <BarChart3 size={18} />
          </div>
          <div className="rw-bars">
            {(skills.length ? skills : [["No skill data", 0]]).map(
              ([s, n], i) => (
                <div className="rw-bar-row" key={s}>
                  <span>{s}</span>
                  <div>
                    <i
                      style={{
                        width: `${(n / maxSkill) * 100}%`,
                        background: palette[i % palette.length],
                      }}
                    />
                  </div>
                  <b>{n}</b>
                </div>
              ),
            )}
          </div>
        </section>
        <section className="rw-card">
          <div className="rw-card-head">
            <div>
              <h2>Applicants by department</h2>
              <p>Role category distribution</p>
            </div>
            <SlidersHorizontal size={18} />
          </div>
          <div className="rw-bars">
            {(departments.length ? departments : [["No applications", 0]]).map(
              ([s, n], i) => (
                <div className="rw-bar-row" key={s}>
                  <span>{s}</span>
                  <div>
                    <i
                      style={{
                        width: `${(n / maxDept) * 100}%`,
                        background: palette[(i + 2) % palette.length],
                      }}
                    />
                  </div>
                  <b>{n}</b>
                </div>
              ),
            )}
          </div>
        </section>
        <section className="rw-card rw-activity">
          <div className="rw-card-head">
            <div>
              <h2>Recent applications</h2>
              <p>Latest candidates in your pipeline</p>
            </div>
            <button
              className="rw-text-button"
              onClick={() => onNavigate("Applications")}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          {apps.slice(0, 4).map((a) => (
            <div className="rw-mini-app" key={a._id}>
              <span className="rw-avatar rw-avatar-image">
                {a.candidateUser?.avatarUrl ? <img src={a.candidateUser.avatarUrl} alt="" /> : (a.name || "?")
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <b>{a.name}</b>
                <small>
                  {a.job?.title || "Role"} ·{" "}
                  {new Date(a.createdAt).toLocaleDateString()}
                </small>
              </div>
              <StatusPill status={a.status} />
            </div>
          ))}
          {!apps.length && (
            <p className="rw-empty">New applications will appear here.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default function RecruiterWorkspace({
  jobs,
  loadingJobs,
  onRefreshJobs,
  onJobUpdated,
  postJobNotice,
  onDismissPostJobNotice,
  onPostJob,
  onEditJob,
  onDeleteJob,
  user,
}) {
  const [section, setSection] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("newest");
  const [profile, setProfile] = useState(null);
  const [updatingJobId, setUpdatingJobId] = useState("");
  const [compare, setCompare] = useState(null);
  const [selected, setSelected] = useState([]);
  const [appliedCompare, setAppliedCompare] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const reload = () => {
    setLoading(true);
    getCompanyApplications()
      .then(setApps)
      .catch((e) => setError(e.message || "Could not load applications."))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    reload();
  }, []);
  const filteredApps = useMemo(
    () =>
      apps
        .filter((a) => {
          const c = a.candidateUser || {};
          const text =
            `${a.name} ${a.job?.title || ""} ${c.headline || ""}`.toLowerCase();
          if (query.trim() && !text.includes(query.trim().toLowerCase())) return false;
          if (filters.status && a.status !== filters.status) return false;
          if (
            filters.skill &&
            !(c.skills || []).some(
              (s) => s.toLowerCase() === filters.skill.toLowerCase(),
            )
          )
            return false;
          if (filters.department && a.job?.category !== filters.department)
            return false;
          if (
            filters.experience &&
            String(val(c.experienceYears)) !== filters.experience
          )
            return false;
          return true;
        })
        .sort((a, b) =>
          sort === "oldest"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : sort === "name"
              ? a.name.localeCompare(b.name)
              : new Date(b.createdAt) - new Date(a.createdAt),
        ),
    [apps, query, filters, sort],
  );
  const filteredJobs = useMemo(
    () =>
      jobs
        .filter((j) => {
          if (
            query.trim() &&
            !`${j.title} ${j.category} ${j.location} ${j.workplace} ${j.type} ${(j.tags || []).join(" ")} ${j.description || ""}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())
          )
            return false;
          if (filters.status && j.status !== filters.status) return false;
          if (
            filters.department &&
            normalizeCategory(j.category) !== normalizeCategory(filters.department)
          )
            return false;
          if (filters.workplace && j.workplace !== filters.workplace)
            return false;
          if (filters.type && j.type !== filters.type) return false;
          if (filters.postDate) {
            const age = Date.now() - new Date(j.createdAt).getTime();
            if (filters.postDate === "7 days" && age > 7 * 86400000)
              return false;
            if (filters.postDate === "30 days" && age > 30 * 86400000)
              return false;
          }
          return true;
        })
        .sort((a, b) =>
          sort === "oldest"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : sort === "name"
              ? a.title.localeCompare(b.title)
              : new Date(b.createdAt) - new Date(a.createdAt),
        ),
    [jobs, query, filters, sort],
  );
  const changeStatus = async (app, status, successMessage = `Candidate moved to ${status.toLowerCase()}.`) => {
    setActionBusy(true);
    try {
      await updateApplicationStatus(app._id, status);
      setApps((xs) =>
        xs.map((x) => (x._id === app._id ? { ...x, status } : x)),
      );
      if (profile?._id === app._id) setProfile({ ...profile, status });
      setActionNotice(successMessage);
      setProfile(null);
      window.setTimeout(() => setActionNotice(""), 3500);
      setActionBusy(false);
      return true;
    } catch (e) {
      setError(e.message || "Could not update status.");
      setActionBusy(false);
      return false;
    }
  };
  const toggleJobStatus = async (job) => {
    const status = job.status === "Closed" ? "Active" : "Closed";
    setUpdatingJobId(job._id);
    setError("");
    try {
      const result = await updateCompanyJob(job._id, { status });
      const updatedJob = result.job || result;
      onJobUpdated?.(updatedJob);
    } catch (e) {
      setError(e.message || `Could not ${status === "Closed" ? "close" : "reopen"} this job.`);
    } finally {
      setUpdatingJobId("");
    }
  };
  const departments = [
    ...new Set(apps.map((a) => a.job?.category).filter(Boolean)),
  ];
  const jobCategories = [
    ...new Map(
      jobs
        .map((job) => String(job.category || "").trim())
        .filter(Boolean)
        .map((category) => [normalizeCategory(category), category]),
    ).values(),
  ];
  const skills = [
    ...new Set(apps.flatMap((a) => a.candidateUser?.skills || [])),
  ];
  const listSection = section === "Applications" || section === "Shortlisted";
  const navigateSection = (nextSection) => {
    setSection(nextSection);
    setQuery("");
    setFilters({});
  };
  const visibleApps =
    section === "Shortlisted"
      ? filteredApps.filter((a) => a.status === "Shortlisted")
      : filteredApps;
  return (
    <div
      className={`rw-shell min-h-screen antialiased ${collapsed ? "is-collapsed" : ""}`}
    >
      <SidebarRecruiter
        section={section}
        collapsed={collapsed}
        jobs={jobs}
        apps={apps}
        user={user}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
        onNavigate={navigateSection}
      />
      <main className="rw-main">
        <div className="rw-content">
          {error && (
            <div className="rw-error">
              {error}
              <button onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}
          {postJobNotice && (
            <div className="rw-error" role="alert">
              {postJobNotice}
              <button type="button" onClick={onDismissPostJobNotice} aria-label="Dismiss message">
                <X size={14} />
              </button>
            </div>
          )}
          {section === "Dashboard" && (
            <Dashboard jobs={jobs} apps={apps} onNavigate={navigateSection} />
          )}
          {section === "My Jobs" && (
            <>
              <div className="rw-heading">
                <div>
                  <div className="rw-eyebrow">YOUR OPENINGS</div>
                  <h1>My jobs</h1>
                  <p>Keep your roles up to date and review every opening.</p>
                </div>
                <div className="flex gap-2">
                  <button className="rw-button" onClick={onRefreshJobs} disabled={loadingJobs}>
                    {loadingJobs ? "Refreshing…" : "Refresh"}
                  </button>
                  <button className="rw-primary" onClick={() => onPostJob(null)}>
                    + Post a role
                  </button>
                </div>
              </div>
              {jobs.length > 0 && <div className="rw-toolbar">
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search jobs by title, category, location, type, or skill..."
                />
                <FilterMenu
                  fields={[
                    {
                      key: "status",
                      label: "Status",
                      options: ["Active", "Closed"],
                    },
                    {
                      key: "department",
                      label: "Category",
                      options: jobCategories,
                    },
                    {
                      key: "workplace",
                      label: "Workplace",
                      options: ["Remote", "Hybrid", "On-site"],
                    },
                    {
                      key: "type",
                      label: "Type",
                      options: [
                        ...new Set(jobs.map((j) => j.type).filter(Boolean)),
                      ],
                    },
                    {
                      key: "postDate",
                      label: "Post date",
                      options: ["7 days", "30 days"],
                    },
                  ]}
                  filters={filters}
                  setFilters={setFilters}
                />
                <select
                  className="rw-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>}
              {jobs.length === 0 && !loadingJobs ? (
                <div className="rw-card rw-empty-state">
                  <Briefcase size={28} />
                  <h2>No jobs posted yet</h2>
                  <p>Add your first job to start receiving applications.</p>
                  <button className="rw-primary" onClick={() => onPostJob(null)}>Add a job</button>
                </div>
              ) : <div className="rw-card rw-table-card">
                <table className="rw-table">
                  <thead>
                    <tr>
                      <th>ROLE</th>
                      <th>CATEGORY</th>
                      <th>WORKPLACE</th>
                      <th>APPLICANTS</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((j) => (
                      <tr key={j._id}>
                        <td>
                          <b>{j.title}</b>
                          <small>{j.location}</small>
                        </td>
                        <td>{j.category}</td>
                        <td>{j.workplace}</td>
                        <td>
                          <span className="rw-count">
                            {j.applicantCount || 0}
                          </span>
                        </td>
                        <td>
                          <StatusPill status={j.status || "Active"} />
                        </td>
                        <td>
                          <div className="rw-job-actions">
                            <button
                              className="rw-link"
                              onClick={() => onEditJob(j)}
                              type="button"
                              title={`Edit ${j.title}`}
                              data-tooltip={`Edit ${j.title}`}
                              data-tooltip-placement="top"
                              aria-label={`Edit ${j.title}`}
                            >
                              <CiEdit size={20}/>
                            </button>
                            <button
                              className="rw-danger-link"
                              onClick={() => onDeleteJob(j)}
                              type="button"
                              title={`Delete ${j.title}`}
                              data-tooltip={`Delete ${j.title}`}
                              data-tooltip-placement="top"
                              aria-label={`Delete ${j.title}`}
                            >
                              <AiTwotoneDelete size={20}/>
                            </button>
                            <button
                              className="rw-link"
                              onClick={() => toggleJobStatus(j)}
                              type="button"
                              disabled={updatingJobId === j._id}
                              title={j.status === "Closed" ? "Reopen this job" : "Close this job"}
                              data-tooltip={j.status === "Closed" ? "Reopen job" : "Close job"}
                              aria-label={j.status === "Closed" ? `Reopen ${j.title}` : `Close ${j.title}`}
                            >
                              {j.status === "Closed" ? <FaDoorOpen size={20}/> : <FaDoorClosed size={20}/>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {loadingJobs && <p className="rw-empty">Loading jobs…</p>}
                {!loadingJobs && jobs.length > 0 && !filteredJobs.length && (
                  <p className="rw-empty">No roles match your filters.</p>
                )}
              </div>}
            </>
          )}
          {listSection && (
            <>
              <div className="rw-heading">
                <div>
                  <div className="rw-eyebrow">CANDIDATE PIPELINE</div>
                  <h1>{section}</h1>
                  <p>
                    {section === "Shortlisted"
                      ? "Your strongest candidates, ready for the next step."
                      : "Review candidate applications and move great people forward."}
                  </p>
                </div>
                <button className="rw-button" onClick={reload}>
                  ↻ Refresh
                </button>
              </div>
              <div className="rw-toolbar">
                <SearchBox value={query} onChange={setQuery} />
                <FilterMenu
                  fields={[
                    {
                      key: "status",
                      label: "Status",
                      options: [...new Set(apps.map((a) => a.status))],
                    },
                    { key: "skill", label: "Skill", options: skills },
                    {
                      key: "department",
                      label: "Department",
                      options: departments,
                    },
                    {
                      key: "experience",
                      label: "Experience (years)",
                      options: [...new Set(apps.map((a) => String(val(a.candidateUser?.experienceYears))))].sort((a, b) => Number(a) - Number(b)),
                    },
                  ]}
                  filters={filters}
                  setFilters={setFilters}
                />
                <select
                  className="rw-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Name A–Z</option>
                </select>
                <span className="rw-results">
                  {visibleApps.length} candidates
                </span>
              </div>
              <div className="rw-card rw-table-card">
                <table className="rw-table">
                  <thead>
                    <tr>
                      <th>CANDIDATE</th>
                      <th>ROLE</th>
                      <th>SKILLS</th>
                      <th>EXPERIENCE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleApps.map((a) => {
                      const c = a.candidateUser || {};
                      return (
                        <tr key={a._id}>
                          <td>
                            <div className="rw-person">
                              <button type="button" className="rw-avatar rw-avatar-image rw-person-open" aria-label={`View ${a.name}'s profile`} onClick={() => setProfile(a)}>
                                {c.avatarUrl ? <img src={c.avatarUrl} alt="" /> : (a.name || "?")
                                  .split(" ")
                                  .map((x) => x[0])
                                  .slice(0, 2)
                                  .join("")}
                              </button>
                              <span>
                                <button type="button" className="rw-person-name" onClick={() => setProfile(a)}>{a.name}</button>
                                <small>{a.email}</small>
                              </span>
                            </div>
                          </td>
                          <td>{a.job?.title || "—"}</td>
                          <td>
                            <div className="rw-tags">
                              {(c.skills || []).slice(0, 2).map((s) => (
                                <i key={s}>{s}</i>
                              ))}
                              {!c.skills?.length && "—"}
                            </div>
                          </td>
                          <td>{val(c.experienceYears)} yrs</td>
                          <td>
                            <StatusPill status={a.status} />
                          </td>
                          <td>
                            {!['Accepted', 'Rejected', 'Interviewing', 'Shortlisted'].includes(a.status) && (
                              <button
                                className="rw-icon-action"
                                title="Shortlist"
                                onClick={() => changeStatus(a, "Shortlisted")}
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {loading ? (
                  <p className="rw-empty">Loading applications…</p>
                ) : (
                  !visibleApps.length && (
                    <p className="rw-empty">
                      No candidates match this view yet.
                    </p>
                  )
                )}
              </div>
            </>
          )}
          {(section === "Test" || section === "Interview") && (
            <div className="rw-underway">
              <span>
                <Sparkles size={22} />
              </span>
              <div className="rw-eyebrow">COMING SOON</div>
              <h1>{section} management is under development</h1>
              <p>
                This workspace will help you coordinate candidate{" "}
                {section.toLowerCase()}s and track outcomes.
              </p>
              <button
                className="rw-button"
                onClick={() => setSection("Shortlisted")}
              >
                View shortlisted candidates
              </button>
            </div>
          )}
        </div>
      </main>
      {profile && (
        <div
          className="rw-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setProfile(null)}
        >
          <section className="rw-profile-modal">
            <button className="rw-modal-close" onClick={() => setProfile(null)}>
              <X size={18} />
            </button>
            <div className="rw-profile-top">
              <span className="rw-profile-avatar rw-avatar-image">
                {profile.candidateUser?.avatarUrl ? <img src={profile.candidateUser.avatarUrl} alt="" /> : (profile.name || "?")
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <div className="rw-eyebrow">CANDIDATE PROFILE</div>
                <h2>{profile.name}</h2>
                <p>
                  {profile.candidateUser?.headline ||
                    profile.job?.title ||
                    "Applicant"}
                </p>
              </div>
              <div className="rw-profile-head-actions">
                <button
                  className="rw-button rw-compare-btn"
                  onClick={() => {
                    setCompare(profile);
                    setSelected([profile._id]);
                    setAppliedCompare(false);
                    setProfile(null);
                  }}
                >
                  Compare <Users size={15} />
                </button>
              </div>
            </div>
            <div className="rw-profile-status">
              <StatusPill status={profile.status} />
              <span>
                Applied {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            <GitHubSummaryCard
              key={profile.candidateUser?.githubUrl || profile.githubUrl || profile._id}
              githubUrl={profile.candidateUser?.githubUrl || profile.githubUrl || ""}
            />
            <div className="rw-profile-grid">
              {[
                ["Email", profile.email],
                ["Location", profile.candidateUser?.location || "Not provided"],
                [
                  "Experience",
                  `${val(profile.candidateUser?.experienceYears)} years`,
                ],
                ["Applied role", profile.job?.title || "—"],
              ].map(([l, v]) => (
                <div key={l}>
                  <small>{l}</small>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <div className="rw-profile-block">
              <h3>About</h3>
              <p>
                {profile.candidateUser?.bio ||
                  profile.message ||
                  "No introduction provided."}
              </p>
            </div>
            <div className="rw-profile-block">
              <h3>Skills</h3>
              <div className="rw-tags">
                {(profile.candidateUser?.skills || []).map((s) => (
                  <i key={s}>{s}</i>
                ))}
                {!profile.candidateUser?.skills?.length && (
                  <span>No skills listed</span>
                )}
              </div>
            </div>
            <div className="rw-profile-block rw-profile-links">
              {[
                ["GitHub", profile.candidateUser?.githubUrl || profile.githubUrl],
                ["Portfolio", profile.candidateUser?.portfolioUrl],
                ["CV", profile.resumeUrl || profile.candidateUser?.resumeUrl],
              ].map(([label, url]) => (
                <a key={label} className={`rw-profile-link-card${url ? "" : " is-unavailable"}`} href={url || undefined} target={url ? "_blank" : undefined} rel={url ? "noreferrer" : undefined} aria-disabled={!url}>
                  <b>{label}</b><span>{url ? (label === "CV" ? "Open CV" : "View profile") : "Not provided"}</span>
                </a>
              ))}
            </div>
            <div className="rw-profile-actions">
              <button
                className="rw-button"
                disabled={actionBusy}
                onClick={() => changeStatus(profile, "Under review", "Candidate moved under review.")}
              >
                Under review
              </button>
              <button
                className="rw-button"
                disabled={actionBusy}
                onClick={() => changeStatus(profile, "Interviewing", "Candidate moved to interviewing.")}
              >
                Interview
              </button>
              <button
                className="rw-button"
                disabled={actionBusy}
                onClick={() => changeStatus(profile, "Accepted")}
              >
                Approve
              </button>
              <button
                className="rw-reject"
                disabled={actionBusy}
                onClick={() => changeStatus(profile, "Rejected")}
              >
                Reject
              </button>
            </div>
          </section>
        </div>
      )}
      {actionNotice && <div className="rw-success-toast" role="status"><Check size={17} />{actionNotice}</div>}
      {compare !== null && (
        <div className="rw-overlay rw-compare-overlay">
          <section className="rw-compare-modal">
            <button className="rw-modal-close" onClick={() => setCompare(null)}>
              <X size={18} />
            </button>
            <div className="rw-eyebrow">CANDIDATE ANALYSIS</div>
            <h2>Compare candidates</h2>
            <p>Select up to five candidates including {compare.name}.</p>
            <div className="rw-compare-pick">
              {apps.map((a) => (
                <label key={a._id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(a._id)}
                    disabled={!selected.includes(a._id) && selected.length >= 5}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, a._id]
                          : selected.filter((x) => x !== a._id),
                      )
                    }
                  />
                  <span className="rw-avatar">{(a.name || "?")[0]}</span>
                  <span>
                    <b>{a.name}</b>
                    <small>{a.job?.title || "Applicant"}</small>
                  </span>
                </label>
              ))}
            </div>
            <button
              className="rw-primary"
              disabled={selected.length < 2}
              onClick={() => setAppliedCompare(true)}
            >
              Apply analysis <ChevronRight size={16} />
            </button>
            {appliedCompare && (
              <div className="rw-comparison-wrap">
                <table className="rw-compare-table">
                  <tbody>
                    {[
                      "Candidate",
                      "Applied role",
                      "Experience",
                      "Skills",
                    ].map((row) => (
                      <tr key={row}>
                        <th>{row}</th>
                        {apps
                          .filter((a) => selected.includes(a._id))
                          .map((a) => {
                            const c = a.candidateUser || {};
                            const skills = c.skills || [];
                            return (
                              <td key={a._id}>
                                {row === "Candidate" ? (
                                  <b>{a.name}</b>
                                ) : row === "Applied role" ? (
                                  a.job?.title || "—"
                                ) : row === "Experience" ? (
                                  `${val(c.experienceYears)} years`
                                ) : row === "Skills" ? (
                                  skills.join(", ") || "Not listed"
                                ) : (
                                  "—"
                                )}
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
