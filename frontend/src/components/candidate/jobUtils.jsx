export function timeAgo(date) {
  if (!date) return "Recently";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000),
  );

  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function CompanyMark({ job }) {
  const initials =
    job.companyInitials || (job.company ? job.company.slice(0, 2).toUpperCase() : "CO");

  return (
    <div
      className="company-avatar-box"
      style={{ backgroundColor: job.companyColor || "#e2e8f0", color: "#0f172a" }}
      aria-hidden="true"
    >
      <span>{initials}</span>
    </div>
  );
}
