import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Github,
  Globe,
  MapPin,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { getMyApplications, updateUserProfile } from "../service/apiCall.js";
import { timeAgo } from "./JobSections.jsx";

const statusBadges = {
  Applied: "badge-status-blue",
  "Under review": "badge-status-amber",
  Interviewing: "badge-status-purple",
  Accepted: "badge-status-emerald",
  Rejected: "badge-status-rose",
  New: "badge-status-blue",
  Reviewing: "badge-status-amber",
  Interview: "badge-status-purple",
  Hired: "badge-status-emerald",
};

export function CandidateProfileModal({
  isOpen,
  user,
  onClose,
  onProfileUpdated,
}) {
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState(user?.headline || "");
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.portfolioUrl || "");
  const [resumeUrl, setResumeUrl] = useState(user?.resumeUrl || "");
  const [location, setLocation] = useState(user?.location || "");
  const [experienceYears, setExperienceYears] = useState(user?.experienceYears || 0);
  const [bio, setBio] = useState(user?.bio || "");
  const [skillsText, setSkillsText] = useState((user?.skills || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHeadline(user.headline || "");
      setGithubUrl(user.githubUrl || "");
      setPortfolioUrl(user.portfolioUrl || "");
      setResumeUrl(user.resumeUrl || "");
      setLocation(user.location || "");
      setExperienceYears(user.experienceYears || 0);
      setBio(user.bio || "");
      setSkillsText((user.skills || []).join(", "));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const skillsArray = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateUserProfile({
        name,
        headline,
        githubUrl,
        portfolioUrl,
        resumeUrl,
        location,
        experienceYears: Number(experienceYears) || 0,
        bio,
        skills: skillsArray,
      });

      setSuccess("Profile successfully updated!");
      onProfileUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card-dialog profile-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-profile-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close profile modal"
        >
          <X size={20} />
        </button>

        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">TECH CANDIDATE DOSSIER</span>
            <h2 id="candidate-profile-title" className="modal-job-title">
              Your Professional Profile
            </h2>
            <p className="modal-job-context">
              Keep your GitHub telemetry and technical stack updated to match with top engineering teams.
            </p>
          </div>
        </div>

        {error && <div className="form-alert-error mb-4">{error}</div>}
        {success && <div className="status-pill-green mb-4">{success}</div>}

        <form className="apply-form-fields" onSubmit={handleSave}>
          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="cand-name">Full Name *</label>
              <input
                id="cand-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input-text"
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="cand-location">Location (City, Country)</label>
              <input
                id="cand-location"
                type="text"
                placeholder="e.g. San Francisco, CA (or Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input-text"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="cand-headline">
              Engineering Title / Specialization
            </label>
            <input
              id="cand-headline"
              type="text"
              placeholder="e.g. Staff Backend Engineer • Go, Raft, Distributed Systems"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="form-input-text"
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="cand-github">
                GitHub Profile URL *
              </label>
              <div className="input-with-icon">
                <Github size={16} className="input-icon" />
                <input
                  id="cand-github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="form-input-text with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="cand-portfolio">
                Portfolio / Personal Website
              </label>
              <div className="input-with-icon">
                <Globe size={16} className="input-icon" />
                <input
                  id="cand-portfolio"
                  type="url"
                  placeholder="https://mywebsite.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="form-input-text with-icon"
                />
              </div>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="cand-resume">
                Resume / Document Link
              </label>
              <input
                id="cand-resume"
                type="url"
                placeholder="https://drive.google.com/... or ReadCV"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="form-input-text"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="cand-exp">
                Years of Professional Experience
              </label>
              <input
                id="cand-exp"
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="form-input-text"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="cand-skills">
              Core Technical Skills <span className="field-hint">(comma separated)</span>
            </label>
            <input
              id="cand-skills"
              type="text"
              placeholder="e.g. Go, Rust, React, TypeScript, Kafka, Kubernetes, PostgreSQL"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="form-input-text"
            />
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="cand-bio">
              Engineering Bio / About Me
            </label>
            <textarea
              id="cand-bio"
              rows={3}
              placeholder="Share your architectural interests, open source contributions, or favorite challenges..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="modal-btns-group mt-3">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit-apply"
              disabled={loading}
            >
              <span>{loading ? "Saving Profile..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MyApplicationsModal({
  isOpen,
  onClose,
  onExplore,
  onSelectJob,
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError("");
    getMyApplications()
      .then(setApplications)
      .catch((err) => setError(err.message || "Could not load applications."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card-dialog applications-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-applications-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close applications modal"
        >
          <X size={20} />
        </button>

        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">CANDIDATE TRACKING PIPELINE</span>
            <h2 id="my-applications-title" className="modal-job-title">
              My Job Applications
            </h2>
            <p className="modal-job-context">
              Real-time status updates directly from hiring teams reviewing your technical profile.
            </p>
          </div>
        </div>

        {error ? (
          <div className="state-card-error p-6">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-slate-500">
            <p>Loading your tracked applications...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="applications-list-wrap">
            {applications.map((app) => {
              const job = app.job || {};
              const badgeClass = statusBadges[app.status] || "badge-status-blue";

              return (
                <div key={app._id} className="candidate-app-item">
                  <div className="app-item-main">
                    <div className="app-company-badge" style={{ backgroundColor: job.companyColor || "#059669" }}>
                      <span>{job.companyInitials || (job.company ? job.company.slice(0, 3).toUpperCase() : "JOB")}</span>
                    </div>

                    <div className="app-info-col">
                      <h4 className="app-job-title">{job.title || "Engineering Role"}</h4>
                      <div className="app-meta-row">
                        <span className="font-semibold text-slate-800">{job.company || app.name}</span>
                        {job.location && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400" /> {job.location} ({job.workplace})
                            </span>
                          </>
                        )}
                        {job.salary && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-600">{job.salary}</span>
                          </>
                        )}
                      </div>
                      <span className="app-date-text">
                        <Clock size={12} /> Applied {timeAgo(app.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="app-item-right">
                    <span className={`status-pill-badge ${badgeClass}`}>
                      {app.status}
                    </span>
                    {app.githubUrl && (
                      <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="app-github-link"
                        title="View submitted GitHub"
                      >
                        <Github size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="state-card-empty py-10">
            <Briefcase size={36} className="text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No applications yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Browse our verified engineering opportunities and fast-track your profile with your GitHub telemetry.
            </p>
            <button
              type="button"
              className="btn-primary-explore"
              onClick={() => {
                onClose();
                onExplore();
              }}
            >
              <span>Explore Tech Jobs</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
