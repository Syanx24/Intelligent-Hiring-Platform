import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Filter,
  Flame,
  Globe,
  Layers,
  MapPin,
  Megaphone,
  Palette,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export const categories = [
  "All roles",
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "People",
];

const categoryCards = [
  {
    name: "Engineering",
    roleCount: "112 open roles",
    description: "Distributed Systems, Backend Go/Rust, Cloud & AI Infrastructure",
    icon: Code2,
    colorClass: "cat-engineering",
  },
  {
    name: "Product",
    roleCount: "34 open roles",
    description: "Technical Product Management, Developer Tooling & Core APIs",
    icon: Layers,
    colorClass: "cat-product",
  },
  {
    name: "Design",
    roleCount: "48 open roles",
    description: "Design Systems, Complex UI/UX, Developer Experience & Motion",
    icon: Palette,
    colorClass: "cat-design",
  },
  {
    name: "Marketing",
    roleCount: "29 open roles",
    description: "Developer Relations (DevRel), Technical Content & Community",
    icon: Megaphone,
    colorClass: "cat-marketing",
  },
];

export function timeAgo(date) {
  if (!date) return "Recently";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
  );
  if (days < 1) return "Today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export function CompanyMark({ job }) {
  const initials =
    job.companyInitials || (job.company ? job.company.slice(0, 2).toUpperCase() : "CO");
  const bgColor = job.companyColor || "#e2e8f0";

  return (
    <div
      className="company-avatar-box"
      style={{
        backgroundColor: bgColor,
        color: "#0f172a",
      }}
      aria-hidden="true"
    >
      <span>{initials}</span>
    </div>
  );
}

export function JobCard({ job, onClick }) {
  const isRemote = job.workplace === "Remote";

  return (
    <article
      className="job-card-elevated"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Top Header */}
      <div className="job-card-head">
        <div className="company-meta-group">
          <CompanyMark job={job} />
          <div>
            <span className="card-company-name">{job.company}</span>
            <div className="card-location-row">
              <MapPin size={13} className="text-slate-400" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        <div className="card-badge-group">
          {job.featured && (
            <span className="featured-pill">
              <Sparkles size={11} /> Featured
            </span>
          )}
          <span className={`workplace-pill ${isRemote ? "pill-remote" : "pill-hybrid"}`}>
            {isRemote && <span className="pulse-dot-green" />}
            {job.workplace}
          </span>
        </div>
      </div>

      {/* Title & Info */}
      <div className="job-card-body">
        <h3 className="job-card-title">{job.title}</h3>
        {job.description && (
          <p className="job-card-summary">
            {job.description.length > 120
              ? `${job.description.slice(0, 120)}...`
              : job.description}
          </p>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="card-tags-list">
            {job.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="skill-chip">
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="skill-chip skill-more">+{job.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="job-card-foot">
        <div className="salary-type-group">
          <span className="card-salary">{job.salary || "Competitive"}</span>
          <span className="card-type-dot">·</span>
          <span className="card-job-type">{job.type || "Full-time"}</span>
        </div>

        <div className="card-action-row">
          <span className="posted-time">
            <Clock size={12} /> {timeAgo(job.createdAt)}
          </span>
          <div className="card-arrow-circle" aria-label="View job">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function TrustRow() {
  return (
    <section className="trust-strip" id="companies">
      <div className="trust-strip-inner">
        <p className="trust-kicker">
          TRUSTED BY LEADERS AT INNOVATIVE COMPANIES WORLDWIDE
        </p>
        <div className="trust-logos-cloud" aria-label="Trusted tech companies">
          <span className="brand-logo-item">
            <strong>LINEAR</strong>
          </span>
          <span className="brand-logo-item">
            <strong>STRIPE</strong>
          </span>
          <span className="brand-logo-item">
            <strong>VERCEL</strong>
          </span>
          <span className="brand-logo-item">
            <strong>FIGMA</strong>
          </span>
          <span className="brand-logo-item">
            <strong>SUPABASE</strong>
          </span>
          <span className="brand-logo-item">
            <strong>RAYCAST</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

export function CategorySection({ onSelectCategory, onExplore }) {
  return (
    <section className="categories-block" id="categories">
      <div className="section-container">
        <div className="section-head-flex">
          <div>
            <div className="kicker-pill">
              <Sparkles size={13} className="text-emerald-600" />
              <span>EXPLORE BY DISCIPLINE</span>
            </div>
            <h2 className="section-title">
              What kind of work feels like <span>you?</span>
            </h2>
            <p className="section-desc">
              Browse top opportunities clustered around the high-impact skills defining the future of tech.
            </p>
          </div>
          <button
            type="button"
            className="secondary-explore-btn"
            onClick={onExplore}
          >
            <span>View all disciplines</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="category-cards-grid">
          {categoryCards.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                className={`category-item-card ${category.colorClass}`}
                onClick={() => onSelectCategory(category.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCategory(category.name);
                  }
                }}
              >
                <div className="category-top-row">
                  <div className="category-icon-box">
                    <Icon size={22} />
                  </div>
                  <span className="category-role-count">{category.roleCount}</span>
                </div>

                <div className="category-info">
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-subtitle">{category.description}</p>
                </div>

                <div className="category-foot-row">
                  <span>Explore open roles</span>
                  <ArrowUpRight size={16} className="category-arrow-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeaturedSection({ jobs, onSelectJob, onExplore }) {
  if (!jobs || !jobs.length) return null;

  return (
    <section className="featured-block">
      <div className="section-container">
        <div className="section-head-flex">
          <div>
            <div className="kicker-pill">
              <Flame size={13} className="text-amber-500" />
              <span>STAFF PICKS & HIGH PRIORITY</span>
            </div>
            <h2 className="section-title">
              Opportunities worth a <span>closer look.</span>
            </h2>
            <p className="section-desc">
              Fast-moving hiring teams actively reviewing applications this week.
            </p>
          </div>
          <button
            type="button"
            className="secondary-explore-btn"
            onClick={onExplore}
          >
            <span>See all {jobs.length} roles</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="featured-cards-grid">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} onClick={() => onSelectJob(job)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function JobsSection({
  jobs,
  activeCategory,
  loading,
  error,
  onCategoryChange,
  onClearFilters,
  onRetry,
  onSelectJob,
  onShowAll,
}) {
  return (
    <section className="jobs-directory-section" id="open-roles">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-head-flex">
          <div>
            <div className="kicker-pill">
              <Zap size={13} className="text-emerald-600" />
              <span>LIVE OPPORTUNITIES</span>
            </div>
            <h2 className="section-title">
              Open doors, <span>right now.</span>
            </h2>
            <p className="section-desc">
              Verified roles at transparent companies with direct hiring manager visibility.
            </p>
          </div>

          <button
            type="button"
            className="clear-filter-btn"
            onClick={onClearFilters}
          >
            <Filter size={15} />
            <span>Reset filters</span>
          </button>
        </div>

        {/* Filter Navigation Bar */}
        <div className="jobs-filter-bar">
          <div className="category-pills-scroll" role="tablist" aria-label="Job categories">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  className={`category-pill-tab ${isActive ? "tab-active" : ""}`}
                  onClick={() => onCategoryChange(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="jobs-count-badge">
            <Briefcase size={15} />
            <span>{loading ? "Searching..." : `${jobs.length} roles available`}</span>
          </div>
        </div>

        {/* Results Container */}
        {error ? (
          <div className="state-card-error">
            <div className="state-icon-circle state-icon-red">
              <Globe size={24} />
            </div>
            <h3>Unable to connect to job service</h3>
            <p>{error}</p>
            <button
              type="button"
              className="btn-retry"
              onClick={onRetry}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="skeletons-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="job-card-skeleton">
                <div className="skeleton-line skeleton-avatar" />
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-desc" />
                <div className="skeleton-line skeleton-tags" />
              </div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="jobs-cards-grid">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => onSelectJob(job)}
              />
            ))}
          </div>
        ) : (
          <div className="state-card-empty">
            <div className="state-icon-circle state-icon-neutral">
              <Search size={24} />
            </div>
            <h3>No roles match your criteria</h3>
            <p>
              Try expanding your search query, switching workplaces, or resetting the filter tags.
            </p>
            <button
              type="button"
              className="btn-show-all"
              onClick={onShowAll}
            >
              Show all open roles
            </button>
          </div>
        )}

        {/* Footer info bar */}
        <div className="directory-footer-row">
          <span className="directory-count-text">
            Displaying {jobs.length} opportunities
          </span>
          <button
            type="button"
            className="back-to-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span>Back to top</span>
            <ArrowDown size={15} className="rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function ClosingCta({ onExplore }) {
  return (
    <section className="cta-banner-section" id="how-it-works">
      <div className="cta-banner-inner">
        {/* Glow ambient effects */}
        <div className="cta-orb-glow cta-glow-left" aria-hidden="true" />
        <div className="cta-orb-glow cta-glow-right" aria-hidden="true" />

        <div className="cta-content-box">
          <div className="cta-sparkle-badge">
            <Sparkles size={16} />
            <span>FASTER, EVIDENCE-BACKED TECH HIRING</span>
          </div>

          <h2 className="cta-heading">
            Build high-impact teams <span>10x faster.</span>
          </h2>

          <p className="cta-body">
            Less resume sifting. Direct GitHub telemetry. Transparent compensation bands. Join fast-moving engineering teams and builders matching through Northstar's technical evaluation engine.
          </p>

          <div className="cta-actions-group">
            <button
              type="button"
              className="btn-cta-primary"
              onClick={onExplore}
            >
              <span>Explore Verified Roles</span>
              <ArrowRight size={17} />
            </button>
            <a
              href="#ai-evaluation"
              className="btn-cta-secondary"
            >
              View AI Vetting Engine
            </a>
          </div>

          <div className="cta-trust-proof">
            <span>✓ Verified GitHub & Code Rigor</span>
            <span>✓ Deep Architecture Extraction</span>
            <span>✓ Direct Engineering Leadership Pacing</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top-grid">
          <div className="footer-brand-column">
            <a className="footer-brand" href="#home" aria-label="Northstar Home">
              <span className="brand-icon-box">
                <Compass size={20} strokeWidth={2.4} />
              </span>
              <span className="brand-name">
                northstar<span className="brand-accent-dot">.</span>
              </span>
            </a>
            <p className="footer-tagline">
              Connecting exceptional builders, designers, and innovators with high-impact teams shaping tomorrow.
            </p>
            <div className="footer-status-pill">
              <span className="pulse-dot-green" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="footer-links-column">
            <h4>For Candidates</h4>
            <ul>
              <li><a href="#open-roles">Browse All Jobs</a></li>
              <li><a href="#categories">Search by Discipline</a></li>
              <li><a href="#open-roles">Remote Opportunities</a></li>
              <li><a href="#companies">Company Profiles</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>For Employers</h4>
            <ul>
              <li><a href="#home">Post a Role</a></li>
              <li><a href="#home">Talent Matching API</a></li>
              <li><a href="#home">Hiring Benchmarks</a></li>
              <li><a href="#home">Recruiter Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#home">About Northstar</a></li>
              <li><a href="#home">Privacy & Terms</a></li>
              <li><a href="#home">Security</a></li>
              <li><a href="#home">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Northstar Technologies, Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#home">Privacy Policy</a>
            <span>·</span>
            <a href="#home">Terms of Service</a>
            <span>·</span>
            <a href="#home">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
