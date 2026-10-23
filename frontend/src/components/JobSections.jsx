import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  Compass,
  Filter,
  Globe2,
  MapPin,
  Search,
} from "lucide-react";

export const categories = [
  "All roles",
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "People",
];

const categoryDetails = [
  { name: "Design", icon: "✳", color: "lavender" },
  { name: "Engineering", icon: "⌘", color: "mint" },
  { name: "Product", icon: "◒", color: "peach" },
  { name: "Marketing", icon: "↗", color: "yellow" },
];

export function timeAgo(date) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
  );
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function CompanyMark({ job }) {
  return (
    <span
      className="company-mark"
      style={{ "--company-color": job.companyColor || "#dff5c4" }}
    >
      {job.companyInitials || job.company.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function JobCard({ job, onClick }) {
  return (
    <button className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <CompanyMark job={job} />
        <span className="job-posted"><Clock3 size={12} /> {timeAgo(job.createdAt)}</span>
      </div>
      <div className="job-card-info">
        <span className="company-name">{job.company}</span>
        <h3>{job.title}</h3>
        <div className="job-location"><MapPin size={14} /> {job.location} <span>·</span> {job.workplace}</div>
      </div>
      <div className="job-card-bottom">
        <span className="salary">{job.salary}</span>
        <span className="job-type">{job.type}</span>
        <span className="card-arrow"><ArrowUpRight size={16} /></span>
      </div>
    </button>
  );
}

export function TrustRow() {
  return (
    <section className="trust-row" id="companies">
      <p>GOOD PEOPLE. GOOD WORK.</p>
      <div className="trusted-logos" aria-label="Featured companies">
        <span className="logo-ribbon">ribbon</span>
        <span className="logo-north">◈ northstar</span>
        <span className="logo-layer">▱ layer</span>
        <span className="logo-arc">arc<span>°</span></span>
        <span className="logo-morrow">morrow</span>
      </div>
      <span className="trust-caption">and 2,400+ teams you’ll love</span>
    </section>
  );
}

export function CategorySection({ onSelectCategory, onExplore }) {
  return (
    <section className="categories-section section-wrap mx-auto w-[90%] max-w-[1160px]">
      <div className="section-heading">
        <div>
          <span className="section-kicker">A GOOD PLACE TO START</span>
          <h2>What feels like <span>you?</span></h2>
        </div>
        <button className="subtle-link" onClick={onExplore}>Explore every role <ArrowRight size={16} /></button>
      </div>
      <div className="category-grid">
        {categoryDetails.map((category) => (
          <button
            key={category.name}
            className="category-card"
            onClick={() => onSelectCategory(category.name)}
          >
            <span className={`category-icon ${category.color}`}>{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-bottom">
              <span>Explore open roles</span><ArrowUpRight size={17} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function FeaturedSection({ jobs, onSelectJob, onExplore }) {
  if (!jobs.length) return null;

  return (
    <section className="featured-section section-wrap mx-auto w-[90%] max-w-[1160px]">
      <div className="section-heading">
        <div>
          <span className="section-kicker">A FEW GOOD ONES</span>
          <h2>Worth a closer <span>look.</span></h2>
        </div>
        <button className="subtle-link" onClick={onExplore}>See all jobs <ArrowRight size={16} /></button>
      </div>
      <div className="featured-grid">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} onClick={() => onSelectJob(job)} />
        ))}
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
    <section className="jobs-section" id="open-roles">
      <div className="section-wrap mx-auto w-[90%] max-w-[1160px]">
        <div className="section-heading jobs-heading">
          <div>
            <span className="section-kicker">THE GOOD STUFF</span>
            <h2>Open doors, <span>right now.</span></h2>
            <p className="section-subtitle">Real roles at good places. Your next step is in here somewhere.</p>
          </div>
          <button className="filter-button" onClick={onClearFilters}>
            <Filter size={15} /> Clear filters
          </button>
        </div>
        <div className="job-controls">
          <div className="category-tabs" role="tablist" aria-label="Filter by job category">
            {categories.map((category) => (
              <button
                key={category}
                role="tab"
                aria-selected={activeCategory === category}
                className={activeCategory === category ? "category-tab active" : "category-tab"}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="job-count">
            <BriefcaseBusiness size={14} /> {loading ? "Finding roles..." : `${jobs.length} roles`}
          </span>
        </div>
        {error ? (
          <div className="state-panel error-panel">
            <span className="state-icon"><Globe2 size={22} /></span>
            <h3>We couldn’t reach the job board.</h3>
            <p>{error} Make sure the API is running and MongoDB is connected, then try again.</p>
            <button className="button button-dark" onClick={onRetry}>Try again</button>
          </div>
        ) : loading ? (
          <div className="loading-grid" aria-label="Loading jobs">
            {[1, 2, 3, 4, 5, 6].map((item) => <div className="job-skeleton" key={item} />)}
          </div>
        ) : jobs.length ? (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} onClick={() => onSelectJob(job)} />
            ))}
          </div>
        ) : (
          <div className="state-panel">
            <span className="state-icon"><Search size={21} /></span>
            <h3>No roles found just yet.</h3>
            <p>Try a different search or clear a filter. The right fit might be just around the corner.</p>
            <button className="button button-dark" onClick={onShowAll}>Show all roles</button>
          </div>
        )}
        <div className="jobs-footer">
          <span>Showing {jobs.length} open roles</span>
          <button
            className="subtle-link"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top <ArrowDown className="back-top-icon" size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export function ClosingCta({ onExplore }) {
  return (
    <section className="closing-cta section-wrap mx-auto w-[90%] max-w-[1160px]" id="how-it-works">
      <div className="closing-spark">✳</div>
      <span className="section-kicker">A BETTER KIND OF SEARCH</span>
      <h2>There’s a place<br />for <span>your kind of good.</span></h2>
      <p>Less endless scrolling. More work that feels right. Let’s find your next thing.</p>
      <button className="button button-lime" onClick={onExplore}>Find your next role <ArrowRight size={16} /></button>
      <div className="cta-orb orb-left" /><div className="cta-orb orb-right" />
    </section>
  );
}
