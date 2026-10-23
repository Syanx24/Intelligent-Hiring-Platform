import { ArrowRight, Check, Clock, MapPin, Sparkles, X } from "lucide-react";
import { CompanyMark, timeAgo } from "./JobSections.jsx";

export function JobDetailsModal({ job, onClose, onApply }) {
  if (!job) return null;

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-card-dialog modal-job-details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-modal-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close job details"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-head-row">
          <CompanyMark job={job} />
          <div className="modal-company-info">
            <span className="modal-kicker-badge">
              {job.category} · {job.workplace}
            </span>
            <h2 id="job-modal-title" className="modal-job-title">
              {job.title}
            </h2>
            <div className="modal-meta-bar">
              <span className="font-semibold text-slate-800">{job.company}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" /> {job.location}
              </span>
              <span>·</span>
              <span className="font-semibold text-emerald-600">{job.salary}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="modal-body-content">
          <h4 className="modal-section-title">About the Role</h4>
          <p className="modal-desc-text">{job.description}</p>

          {job.tags && job.tags.length > 0 && (
            <div className="modal-skills-section">
              <h4 className="modal-section-title">Key Skills & Technologies</h4>
              <div className="modal-tags-wrap">
                {job.tags.map((tag) => (
                  <span key={tag} className="modal-skill-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-action">
          <span className="modal-posted-date">
            <Clock size={14} /> Posted {timeAgo(job.createdAt)}
          </span>
          <div className="modal-btns-group">
            <button
              type="button"
              className="modal-btn-cancel"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="modal-btn-apply"
              onClick={onApply}
            >
              <span>Apply for this role</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ApplicationModal({
  job,
  user,
  status,
  error,
  onClose,
  onSubmit,
}) {
  if (!job) return null;

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal-card-dialog modal-apply-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close application"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="apply-success-box">
            <div className="success-icon-ring">
              <Check size={28} />
            </div>
            <div className="kicker-pill mx-auto">
              <Sparkles size={13} className="text-emerald-600" />
              <span>APPLICATION DISPATCHED</span>
            </div>
            <h2 id="apply-title" className="success-headline">
              You’re all set!
            </h2>
            <p className="success-message">
              Your application for <strong>{job.title}</strong> at{" "}
              <strong>{job.company}</strong> has been transmitted directly to the hiring team.
            </p>
            <button
              type="button"
              className="btn-primary-explore mx-auto"
              onClick={onClose}
            >
              Back to Job Board
            </button>
          </div>
        ) : (
          <>
            <div className="modal-head-row">
              <div className="modal-company-info">
                <span className="modal-kicker-badge">
                  FAST-TRACK CANDIDATE APPLICATION
                </span>
                <h2 id="apply-title" className="modal-job-title">
                  Apply for this role
                </h2>
                <p className="modal-job-context">
                  Applying for <strong>{job.title}</strong> at <strong>{job.company}</strong>
                </p>
              </div>
            </div>

            <form className="apply-form-fields" onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="apply-name" className="field-label">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="apply-name"
                  name="name"
                  defaultValue={user?.name || ""}
                  autoComplete="name"
                  placeholder="e.g. Alex Morgan"
                  required
                  maxLength={100}
                  className="form-input-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apply-email" className="field-label">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="apply-email"
                  name="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  autoComplete="email"
                  placeholder="e.g. alex@example.com"
                  required
                  className="form-input-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apply-github" className="field-label">
                  GitHub Profile Link{" "}
                  <span className="field-hint">(Recommended for engineering telemetry)</span>
                </label>
                <input
                  id="apply-github"
                  name="githubUrl"
                  type="url"
                  defaultValue={user?.githubUrl || ""}
                  placeholder="https://github.com/..."
                  className="form-input-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apply-resume" className="field-label">
                  Resume / Portfolio URL{" "}
                  <span className="field-hint">(Google Drive, Dropbox, or ReadCV)</span>
                </label>
                <input
                  id="apply-resume"
                  name="resumeUrl"
                  type="url"
                  defaultValue={user?.resumeUrl || ""}
                  placeholder="https://..."
                  className="form-input-text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apply-message" className="field-label">
                  Note to Hiring Team{" "}
                  <span className="field-hint">(optional)</span>
                </label>
                <textarea
                  id="apply-message"
                  name="message"
                  rows={3}
                  maxLength={2000}
                  placeholder="Share what excites you about this role or team..."
                  className="form-textarea"
                />
              </div>

              {error && (
                <div className="form-alert-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-submit-apply"
                disabled={status === "submitting"}
              >
                <span>
                  {status === "submitting" ? "Submitting application..." : "Send Application"}
                </span>
                <ArrowRight size={16} />
              </button>

              <p className="form-privacy-note">
                🔒 Your application is sent securely directly to the hiring decision-makers.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
