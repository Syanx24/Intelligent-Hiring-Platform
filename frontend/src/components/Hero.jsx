import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  GitBranch,
  GitPullRequest,
  MapPin,
  Search,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function Hero({
  search,
  location,
  onSearchChange,
  onLocationChange,
  onExplore,
}) {
  return (
    <section className="hero-section">
      {/* Background glow orbs */}
      <div className="hero-bg-glow hero-bg-glow-1" aria-hidden="true" />
      <div className="hero-bg-glow hero-bg-glow-2" aria-hidden="true" />

      <div className="hero-container">
        {/* Left column: Value Proposition & Engineering Search */}
        <div className="hero-content">
          <div className="hero-pill-badge">
            <span className="hero-badge-pulse">
              <span className="pulse-dot" />
              <span className="pulse-ring" />
            </span>
            <span className="hero-badge-text">AI-POWERED ENGINEERING HIRING PLATFORM</span>
            <span className="hero-badge-tag">v2.4 AI</span>
          </div>

          <h1 className="hero-title">
            Engineering Hiring,{" "}
            <span className="hero-gradient-text">Powered by AI.</span>
          </h1>

          <p className="hero-subtitle">
            Evaluate deep technical capability in minutes, not weeks. Northstar combines GitHub code telemetry, resume architecture extraction, and AI skill verification to match elite software engineers with breakthrough teams.
          </p>

          {/* Search Capsule */}
          <form
            className="hero-search-box"
            onSubmit={(event) => {
              event.preventDefault();
              onExplore();
            }}
            role="search"
          >
            <div className="search-field-group">
              <Search className="field-icon" size={20} />
              <input
                id="hero-search-input"
                aria-label="Search by language, framework, or architecture"
                placeholder="Search by language, framework, or architecture (e.g. Go, React, Rust, Distributed Systems)..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="search-input"
              />
            </div>

            <div className="search-divider" aria-hidden="true" />

            <div className="search-field-group search-location-group">
              <MapPin className="field-icon" size={20} />
              <select
                id="hero-location-select"
                aria-label="Workplace arrangement"
                value={location}
                onChange={(event) => onLocationChange(event.target.value)}
                className="search-select"
              >
                <option value="">Any workplace</option>
                <option value="Remote">Remote only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
              <ChevronDown className="select-arrow" size={16} />
            </div>

            <button type="submit" className="hero-search-btn" aria-label="Search engineering roles">
              <span>Find Roles</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Popular Engineering Search Tags */}
          <div className="hero-tags-row">
            <span className="hero-tags-label">Trending Stacks:</span>
            <div className="hero-tags-list">
              {[
                { label: "Distributed Systems", role: "Engineering", workplace: "" },
                { label: "Remote Go / Rust", role: "Engineering", workplace: "Remote" },
                { label: "Staff Full-Stack", role: "Engineering", workplace: "" },
                { label: "AI Infrastructure", role: "Engineering", workplace: "" },
                { label: "Lead Frontend", role: "Engineering", workplace: "" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className="hero-tag-pill"
                  onClick={() => {
                    onSearchChange(item.role);
                    onLocationChange(item.workplace);
                    onExplore();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Engineering Hiring Stats Bar */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-number">2,400+</span>
              <span className="stat-label">Verified Tech Roles</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-item">
              <span className="stat-number">98.2%</span>
              <span className="stat-label">Technical Match Precision</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-item">
              <span className="stat-number">4.8 Days</span>
              <span className="stat-label">Avg. Fast-Track Offer</span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive AI Engineering Dashboard Preview */}
        <div className="hero-visual-wrapper">
          {/* Ambient Glow behind card */}
          <div className="visual-backdrop-glow" />

          {/* Floating Top Pill: GitHub Rigor */}
          <div className="hero-float-card float-badge-top">
            <div className="float-badge-icon pulse-emerald">
              <GitPullRequest size={16} />
            </div>
            <div className="float-badge-content">
              <strong>GitHub Telemetry Verified</strong>
              <small>Top 1% PR review velocity • 98% test rigor</small>
            </div>
            <Sparkles size={16} className="float-accent-icon" />
          </div>

          {/* Main Engineering Showcase Card */}
          <div className="match-card-preview">
            <div className="match-card-header">
              <div className="match-company-logo">
                <Cpu size={24} />
              </div>
              <div className="match-company-meta">
                <div className="company-badge-row">
                  <span className="match-company-name">Linear Infrastructure</span>
                  <span className="verified-badge">
                    <CheckCircle2 size={13} /> AI Verified
                  </span>
                </div>
                <span className="match-job-role">Principal Systems Engineer</span>
              </div>
              <span className="match-score-pill">
                <Sparkles size={13} /> 99.2% Match
              </span>
            </div>

            <p className="match-card-desc">
              Architect high-concurrency event buses and low-latency storage engines. Vetted for mastery in Go, Raft consensus, and distributed guarantees.
            </p>

            {/* AI Architecture Assessment Criteria */}
            <div className="match-criteria-container">
              <div className="match-criteria-row">
                <div className="criteria-label">
                  <span>Distributed Consensus & Concurrency (Go / Raft)</span>
                  <span className="criteria-pct">99%</span>
                </div>
                <div className="criteria-progress-bar">
                  <div className="criteria-progress-fill" style={{ width: "99%" }} />
                </div>
              </div>

              <div className="match-criteria-row">
                <div className="criteria-label">
                  <span>Production Scale Vetting (120k QPS Verified)</span>
                  <span className="criteria-pct">97%</span>
                </div>
                <div className="criteria-progress-bar">
                  <div className="criteria-progress-fill" style={{ width: "97%" }} />
                </div>
              </div>
            </div>

            {/* Tech Stack Tags */}
            <div className="match-tags-row">
              <span className="match-tag tag-emerald">Go 1.22</span>
              <span className="match-tag tag-blue">Distributed Systems</span>
              <span className="match-tag tag-neutral">Kafka & Raft</span>
              <span className="match-tag tag-neutral">$190k – $240k</span>
              <span className="match-tag tag-neutral">Remote (Global)</span>
            </div>

            {/* Card Action & GitHub Insights Telemetry Bar */}
            <div className="match-card-footer">
              <div className="telemetry-compact-row">
                <GitBranch size={14} className="text-emerald-500" />
                <span className="applicants-text">
                  <strong>1,840 commits</strong> · 54 OSS PRs analyzed
                </span>
              </div>
              <button
                type="button"
                className="match-preview-btn"
                onClick={onExplore}
                aria-label="View matching engineering role"
              >
                <span>Inspect Spec</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          {/* Floating Bottom Pill: AI Architecture Audit */}
          <div className="hero-float-card float-badge-bottom">
            <div className="float-badge-icon pulse-blue">
              <Zap size={16} />
            </div>
            <div className="float-badge-content">
              <strong>AI Architecture Audit</strong>
              <small>Level 6 (Staff/Principal) • Zero Fluff</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
