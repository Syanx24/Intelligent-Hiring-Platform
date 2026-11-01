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
