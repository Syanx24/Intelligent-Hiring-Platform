import { ArrowRight, Check, Clock3, X } from "lucide-react";
import { CompanyMark, timeAgo } from "./JobSections.jsx";

export function JobDetailsModal({ job, onClose, onApply }) {
  if (!job) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="job-modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close job details"><X size={19} /></button>
        <CompanyMark job={job} />
        <span className="section-kicker modal-kicker">{job.category} · {job.workplace}</span>
        <h2 id="job-modal-title">{job.title}</h2>
        <div className="modal-meta">{job.company} <span>·</span> {job.location} <span>·</span> {job.salary}</div>
        <p className="modal-description">{job.description}</p>
        {job.tags?.length > 0 && (
          <div className="tag-list">{job.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        )}
        <div className="modal-footer">
          <span><Clock3 size={14} /> Posted {timeAgo(job.createdAt)}</span>
          <button className="button button-dark" onClick={onApply}>Apply for this role <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

export function ApplicationModal({
  job,
  status,
  error,
  onClose,
  onSubmit,
}) {
  if (!job) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="apply-title">
        <button className="modal-close" onClick={onClose} aria-label="Close application"><X size={19} /></button>
        {status === "success" ? (
          <div className="success-state">
            <span className="success-check"><Check size={24} /></span>
            <span className="section-kicker">ONE STEP CLOSER</span>
            <h2 id="apply-title">You’re in.</h2>
            <p>Your application for <strong>{job.title}</strong> at {job.company} is on its way. Good luck — we’re rooting for you.</p>
            <button className="button button-dark" onClick={onClose}>Back to exploring</button>
          </div>
        ) : (
          <>
            <span className="section-kicker">MAKE YOUR MOVE</span>
            <h2 id="apply-title">Apply for this role.</h2>
            <p className="apply-job-name">{job.title} <span>at {job.company}</span></p>
            <form className="application-form" onSubmit={onSubmit}>
              <label>Your name<input name="name" autoComplete="name" placeholder="Jamie Taylor" required maxLength="100" /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="jamie@email.com" required /></label>
              <label>Resume link <span className="optional-label">optional</span><input name="resumeUrl" type="url" placeholder="https://your-resume.com" /></label>
              <label>A note for the team <span className="optional-label">optional</span><textarea name="message" rows="3" maxLength="2000" placeholder="What makes this role feel right for you?" /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-dark submit-application" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending..." : "Send my application"} <ArrowRight size={16} />
              </button>
              <p className="form-privacy">Your details go directly to the hiring team.</p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
