export function timeAgo(date) {
  if (!date) return "recently";
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "recently";
  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return minutes < 1 ? "just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function CompanyMark({ job }) {
  const initials =
    job.companyInitials || (job.company ? job.company.slice(0, 2).toUpperCase() : "CO");
  const avatarUrl = job.companyAvatarUrl || job.avatarUrl;

  return (
    <div
      className="company-avatar-box overflow-hidden relative"
      style={{ backgroundColor: job.companyColor || "#e2e8f0", color: "#0f172a" }}
      aria-hidden="true"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={job.company || "Company"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to text if image fails to load
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <span className={avatarUrl ? "sr-only" : ""}>{initials}</span>
    </div>
  );
}
