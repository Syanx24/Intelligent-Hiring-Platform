import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  FileText,
  Github,
  Globe,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  createCompanyJob,
  deleteCompanyJob,
  getMyCompanyJobs,
  updateCompanyJob,
} from "../../service/recruiter/recruiterAPI.js";
import {
  getJobApplicants,
  updateApplicationStatus,
} from "../../service/application/jobApplicationAPI.js";
import {
  removeProfileAvatar,
  updateUserProfile,
  uploadProfileAvatar,
} from "../../service/authAPI.js";
import { getRecruiterProfileCompleteness } from "../../utils/recruiterProfile.js";
import { timeAgo } from "../candidate/jobUtils.jsx";

const statusBadges = {
  Applied: "badge-status-blue",
  "Under review": "badge-status-amber",
  Interviewing: "badge-status-purple",
  Accepted: "badge-status-emerald",
  Rejected: "badge-status-rose",
};

/* ==========================================================================
   1. COMPANY DASHBOARD MODAL
   ========================================================================== */

export function CompanyDashboardModal({
  isOpen,
  user,
  onClose,
  onOpenPostJob,
  onOpenEditJob,
  onOpenApplicants,
  onOpenCompanyProfile,
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchJobs = () => {
    setLoading(true);
    setError("");
    getMyCompanyJobs()
      .then(setJobs)
      .catch((err) => setError(err.message || "Failed to load company jobs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete the job listing "${title}" and all its applicants?`)) {
      return;
    }
    setDeletingId(jobId);
    try {
      await deleteCompanyJob(jobId);
      setJobs((current) => current.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.message || "Could not delete job.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card-dialog company-dashboard-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-dashboard-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close dashboard"
        >
          <X size={20} />
        </button>

        {/* Dashboard Header */}
        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">RECRUITER WORKSPACE</span>
            <h2 id="company-dashboard-title" className="modal-job-title">
              {user?.companyName || user?.name || "Company"} Dashboard
            </h2>
            <p className="modal-job-context">
              Manage your engineering job listings, review technical applicant pipelines, and update hiring statuses.
            </p>
          </div>
        </div>

        {/* Action Bar & Quick Stats */}
        <div className="company-stats-grid">
          <div className="kpi-card">
            <span className="kpi-num">{jobs.length}</span>
            <span className="kpi-label">Active Listings</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-num text-emerald-600">{totalApplicants}</span>
            <span className="kpi-label">Total Applicants</span>
          </div>
          <div className="kpi-card flex items-center justify-center p-3">
            <button
              type="button"
              className="btn-primary-explore w-full text-center justify-center"
              onClick={() => {
                onOpenPostJob(null);
              }}
            >
              <Plus size={16} />
              <span>Post New Role</span>
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {error ? (
          <div className="state-card-error p-6 my-4">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-slate-500">
            <p>Loading your company listings...</p>
          </div>
        ) : jobs.length > 0 ? (
          <div className="company-jobs-list mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Your Posted Roles ({jobs.length})
            </h4>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job._id} className="company-job-item">
                  <div className="job-item-left">
                    <h4 className="company-job-name">{job.title}</h4>
                    <div className="company-job-submeta">
                      <span>{job.category}</span>
                      <span>·</span>
                      <span>{job.workplace}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">{job.salary}</span>
                      <span>·</span>
                      <span className="text-slate-400">
                        <Clock size={11} className="inline mr-1" />
                        {timeAgo(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="job-item-actions">
                    <button
                      type="button"
                      className="btn-applicants-view"
                      onClick={() => onOpenApplicants(job)}
                    >
                      <Users size={15} />
                      <span>
                        Applicants ({job.applicantCount || 0})
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn-job-icon-edit"
                      onClick={() => onOpenEditJob(job)}
                      title="Edit job listing"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn-job-icon-delete"
                      disabled={deletingId === job._id}
                      onClick={() => handleDelete(job._id, job.title)}
                      title="Delete job listing"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="state-card-empty py-10 my-4">
            <Briefcase size={36} className="text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No jobs posted yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Create your first tech role to start receiving verified candidate matches.
            </p>
            <button
              type="button"
              className="btn-primary-explore"
              onClick={() => onOpenPostJob(null)}
            >
              <Plus size={16} />
              <span>Post Your First Job</span>
            </button>
          </div>
        )}

        <div className="modal-footer-action mt-6">
          <button
            type="button"
            className="secondary-explore-btn"
            onClick={onOpenCompanyProfile}
          >
            <Building2 size={15} />
            <span>Edit Company Profile</span>
          </button>
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={onClose}
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. JOB APPLICANTS MODAL
   ========================================================================== */

export function JobApplicantsModal({
  isOpen,
  job,
  onClose,
}) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !job?._id) return;

    setLoading(true);
    setError("");
    getJobApplicants(job._id)
      .then((data) => setApplicants(data.applicants || []))
      .catch((err) => setError(err.message || "Failed to load applicants."))
      .finally(() => setLoading(false));
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplicants((current) =>
        current.map((a) => (a._id === appId ? { ...a, status: newStatus } : a)),
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
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
        className="modal-card-dialog applicants-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicants-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close applicants modal"
        >
          <X size={20} />
        </button>

        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">APPLICANT PIPELINE</span>
            <h2 id="applicants-title" className="modal-job-title">
              Applicants for {job.title}
            </h2>
            <p className="modal-job-context">
              Review technical candidates, inspect GitHub links, and update hiring pipeline status.
            </p>
          </div>
        </div>

        {error ? (
          <div className="state-card-error p-6">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-slate-500">
            <p>Loading candidate submissions...</p>
          </div>
        ) : applicants.length > 0 ? (
          <div className="applicants-review-list">
            {applicants.map((app) => {
              const cand = app.candidateUser || {};
              const github = app.githubUrl || cand.githubUrl;
              const resume = app.resumeUrl || cand.resumeUrl;

              return (
                <div key={app._id} className="applicant-review-card">
                  <div className="applicant-top-bar">
                    <div className="flex items-start gap-3">
                      {cand.avatarUrl ? (
                        <img
                          src={cand.avatarUrl}
                          alt={app.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {app.name ? app.name.slice(0, 2).toUpperCase() : "CA"}
                        </div>
                      )}
                      <div>
                        <h4 className="applicant-name">{app.name}</h4>
                        <p className="applicant-email">{app.email}</p>
                        {cand.headline && (
                          <p className="applicant-headline">{cand.headline}</p>
                        )}
                      </div>
                    </div>

                    <div className="status-selector-wrap">
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Application Status
                      </label>
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`status-select ${statusBadges[app.status] || "badge-status-blue"}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under review">Under review</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills Chips */}
                  {cand.skills && cand.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {cand.skills.map((s) => (
                        <span key={s} className="skill-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message */}
                  {app.message && (
                    <div className="applicant-note-box">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Candidate Note:
                      </span>
                      <p className="text-xs text-slate-600 m-0 leading-relaxed">{app.message}</p>
                    </div>
                  )}

                  {/* Footer Links */}
                  <div className="applicant-card-foot">
                    <span className="text-xs text-slate-400">
                      Applied {timeAgo(app.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {github && (
                        <a
                          href={github}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-applicant-link"
                          title="Inspect GitHub Telemetry"
                        >
                          <Github size={14} />
                          <span>GitHub Profile</span>
                          <ExternalLink size={12} />
                        </a>
                      )}

                      {resume && (
                        <a
                          href={resume}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-applicant-link"
                          title="Open Candidate CV / Resume"
                        >
                          <FileText size={14} className="text-rose-500" />
                          <span>View CV (PDF)</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="state-card-empty py-10">
            <Users size={36} className="text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No applicants yet</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Your job is live on the board. Candidates will appear here as soon as they submit applications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   3. POST / EDIT JOB MODAL
   ========================================================================== */

export function PostJobModal({
  isOpen,
  jobToEdit = null,
  onClose,
  onJobSaved,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [type, setType] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title || "");
      setCategory(jobToEdit.category || "");
      setWorkplace(jobToEdit.workplace || "");
      setType(jobToEdit.type || "");
      setSalary(jobToEdit.salary || "");
      setLocation(jobToEdit.location || "Remote");
      setTagsText((jobToEdit.tags || []).join(", "));
      setDescription(jobToEdit.description || "");
    } else {
      setTitle("");
      setCategory("");
      setWorkplace("");
      setType("");
      setSalary("");
      setLocation("");
      setTagsText("");
      setDescription("");
    }
    setError("");
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        category,
        workplace,
        type,
        salary,
        location,
        tags,
        description,
      };

      let result;
      if (jobToEdit?._id) {
        result = await updateCompanyJob(jobToEdit._id, payload);
      } else {
        result = await createCompanyJob(payload);
      }

      onJobSaved(result.job || result);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save job listing.");
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
        className="modal-card-dialog post-job-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close job form"
        >
          <X size={20} />
        </button>

        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">
              {jobToEdit ? "EDIT LISTING" : "NEW JOB CREATION"}
            </span>
            <h2 id="post-job-title" className="modal-job-title">
              {jobToEdit ? "Update Job Listing" : "Post an Engineering Role"}
            </h2>
            <p className="modal-job-context">
              Reach thousands of verified software engineers and builders with transparent compensation.
            </p>
          </div>
        </div>

        {error && <div className="form-alert-error mb-4">{error}</div>}

        <form className="apply-form-fields" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="field-label" htmlFor="job-title-input">
              Role Title *
            </label>
            <input
              id="job-title-input"
              type="text"
              placeholder="e.g. Senior Distributed Systems Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-input-text"
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="job-cat-select">Category *</label>
              <select
                id="job-cat-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input-text"
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="People">People</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="job-workplace-select">Workplace *</label>
              <select
                id="job-workplace-select"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="form-input-text"
                required
              >
                <option value="" disabled>Select a workplace</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="job-type-select">Employment Type *</label>
            <select
              id="job-type-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-input-text"
              required
            >
              <option value="" disabled>Select an employment type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="job-salary-input">
                Salary Range * <span className="field-hint">(e.g. $170k – $220k)</span>
              </label>
              <input
                id="job-salary-input"
                type="text"
                placeholder="e.g. $180k – $230k"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                className="form-input-text"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="job-location-input">
                Location * <span className="field-hint">(e.g. Remote, US or San Francisco)</span>
              </label>
              <input
                id="job-location-input"
                type="text"
                placeholder="e.g. Remote (US/EU)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="form-input-text"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="job-tags-input">
              Tech Stack & Key Skills <span className="field-hint">(comma separated)</span>
            </label>
            <input
              id="job-tags-input"
              type="text"
              placeholder="e.g. Go, Rust, Raft, Kafka, Distributed Systems"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="form-input-text"
            />
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="job-desc-input">
              Job Description & Engineering Scope *
            </label>
            <textarea
              id="job-desc-input"
              rows={4}
              placeholder="Detail your engineering challenges, tech stack, autonomy, and team culture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-textarea"
            />
          </div>

          <div className="modal-btns-group mt-4">
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
              <span>{loading ? "Publishing..." : jobToEdit ? "Update Job" : "Publish Job Listing"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. COMPANY PROFILE MODAL
   ========================================================================== */

export function CompanyProfileModal({
  isOpen,
  user,
  onClose,
  onProfileUpdated,
}) {
  const [name, setName] = useState(user?.name || "");
  const [position, setPosition] = useState(user?.position || "");
  const [companyName, setCompanyName] = useState(user?.companyName || user?.name || "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || "");
  const [companyDescription, setCompanyDescription] = useState(user?.companyDescription || "");
  const [companyLocation, setCompanyLocation] = useState(user?.companyLocation || "");
  const [companySize, setCompanySize] = useState(user?.companySize || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDragActive, setAvatarDragActive] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPosition(user.position || "");
      setCompanyName(user.companyName || user.name || "");
      setCompanyWebsite(user.companyWebsite || "");
      setCompanyDescription(user.companyDescription || "");
      setCompanyLocation(user.companyLocation || "");
      setCompanySize(user.companySize || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const profileCompleteness = getRecruiterProfileCompleteness({
    name,
    position,
    avatarUrl,
    companyName,
    companyWebsite,
    companyLocation,
    companySize,
    companyDescription,
  });

  const handleAvatarFileUpload = async (file) => {
    if (!file) return;
    setAvatarError("");
    setAvatarSuccess("");

    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);

    if (!isImage) {
      setAvatarError("Please select a valid image file (JPG, PNG, WEBP, GIF, SVG).");
      return;
    }

    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setAvatarError(`Image size exceeds 3MB limit (selected: ${sizeMb} MB).`);
      return;
    }

    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result;
          const res = await uploadProfileAvatar({
            fileName: file.name,
            fileData,
          });
          setAvatarUrl(res.avatarUrl);
          setAvatarSuccess("Profile photo / company logo updated!");
          if (onProfileUpdated && res.user) {
            onProfileUpdated(res.user);
          }
          setTimeout(() => setAvatarSuccess(""), 4000);
        } catch (uploadErr) {
          setAvatarError(uploadErr.message || "Failed to upload photo. Please try again.");
        } finally {
          setAvatarUploading(false);
        }
      };
      reader.onerror = () => {
        setAvatarError("Failed to read image file.");
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAvatarError(err.message || "Failed to process image file.");
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!window.confirm("Remove company logo/photo?")) return;
    setAvatarError("");
    setAvatarSuccess("");
    setAvatarUploading(true);
    try {
      const res = await removeProfileAvatar();
      setAvatarUrl("");
      setAvatarSuccess("Photo removed.");
      if (onProfileUpdated && res.user) {
        onProfileUpdated(res.user);
      }
      setTimeout(() => setAvatarSuccess(""), 4000);
    } catch (err) {
      setAvatarError(err.message || "Could not remove photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const updated = await updateUserProfile({
        name,
        position,
        companyName,
        companyWebsite,
        companyDescription,
        companyLocation,
        companySize,
        avatarUrl,
      });

      setSuccess("Company profile updated successfully!");
      onProfileUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || "Failed to update company profile.");
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
        aria-labelledby="company-profile-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="modal-head-row">
          <div className="modal-company-info">
            <span className="modal-kicker-badge">RECRUITER PROFILE</span>
            <h2 id="company-profile-title" className="modal-job-title">
              Company & Personal Profile
            </h2>
            <p className="modal-job-context">
              Manage your personal details, company information, and recruiter photo.
            </p>
          </div>
        </div>

        {error && <div className="form-alert-error mb-4">{error}</div>}
        {success && <div className="status-pill-green mb-4">{success}</div>}

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <b className="text-slate-800">Profile completeness</b>
            <span className="font-semibold text-slate-600">{profileCompleteness.percentage}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Recruiter profile completeness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={profileCompleteness.percentage}
          >
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${profileCompleteness.percentage}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {profileCompleteness.isComplete
              ? "Your profile is complete. You can post jobs."
              : `Complete these details before posting a job: ${profileCompleteness.missing.join(", ")}.`}
          </p>
        </div>

        {/* Recruiter profile photo upload section */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Personal Profile Photo
              </label>
              <p className="text-[11px] text-slate-500">
                Add a clear photo so candidates and your team can recognize you.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              JPG, PNG, WEBP • MAX 3MB
            </span>
          </div>

          {avatarError && <div className="form-alert-error text-xs p-2">{avatarError}</div>}
          {avatarSuccess && <div className="status-pill-green text-xs p-2">{avatarSuccess}</div>}

          <div className="flex items-center gap-4">
            <input
              id="recruiter-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleAvatarFileUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            <button
              type="button"
              disabled={avatarUploading}
              aria-label={avatarUrl ? "Replace personal profile photo" : "Add personal profile photo"}
              onClick={() => document.getElementById("recruiter-avatar-input")?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setAvatarDragActive(true);
              }}
              onDragLeave={() => setAvatarDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setAvatarDragActive(false);
                if (e.dataTransfer.files?.[0]) handleAvatarFileUpload(e.dataTransfer.files[0]);
              }}
              className={`group relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                avatarDragActive ? "border-emerald-500" : "border-slate-200"
              } ${avatarUrl ? "cursor-pointer" : "border-dashed bg-white hover:border-emerald-500"}`}
            >
              {avatarUrl ? (
                <>
                  <img src={avatarUrl} alt={name || "Recruiter profile photo"} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-slate-950/65 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Camera size={18} />
                    Replace photo
                  </span>
                </>
              ) : (
                <span className="flex h-full flex-col items-center justify-center gap-1 text-slate-600">
                  {avatarUploading ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                  <span className="text-xs font-semibold">{avatarUploading ? "Uploading..." : "Add photo"}</span>
                </span>
              )}
              {avatarUploading && avatarUrl && (
                <span className="absolute inset-0 flex items-center justify-center bg-white/75">
                  <RefreshCw size={20} className="animate-spin text-emerald-600" />
                </span>
              )}
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={avatarUploading}
                className="shrink-0 p-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
                title="Remove profile photo"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}
          </div>
        </div>

        <form className="apply-form-fields" onSubmit={handleSave}>
          <h3 className="text-sm font-bold text-slate-800">Personal Details</h3>
          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="recruiter-person-name">Full Name *</label>
              <input
                id="recruiter-person-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input-text"
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="recruiter-person-email">Account Email</label>
              <input
                id="recruiter-person-email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="form-input-text"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="field-label" htmlFor="recruiter-position">Position at Company *</label>
            <input
              id="recruiter-position"
              type="text"
              placeholder="e.g. Talent Acquisition Manager"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
              className="form-input-text"
            />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Company Details</h3>
          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="comp-name">Company Name *</label>
              <input
                id="comp-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="form-input-text"
              />
            </div>
            <div className="form-group">
              <label className="field-label" htmlFor="comp-website">Website URL *</label>
              <input
                id="comp-website"
                type="url"
                placeholder="https://company.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                required
                className="form-input-text"
              />
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="field-label" htmlFor="comp-location">Headquarters Location *</label>
              <input
                id="comp-location"
                type="text"
                placeholder="e.g. San Francisco, CA & Remote"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                required
                className="form-input-text"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="comp-size">Company Size</label>
              <select
                id="comp-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="form-input-text"
                required
              >
                <option value="" disabled>Select company size</option>
                <option value="1-10">1 - 10 employees</option>
                <option value="10-50">10 - 50 employees</option>
                <option value="50-200">50 - 200 employees</option>
                <option value="200-1000">200 - 1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="comp-desc">
              Company Mission & Culture Summary *
            </label>
            <textarea
              id="comp-desc"
              rows={3}
              placeholder="Tell candidates what your engineering team is building and the values you prioritize..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              required
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
              <span>{loading ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
