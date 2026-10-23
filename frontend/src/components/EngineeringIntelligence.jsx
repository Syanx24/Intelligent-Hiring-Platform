import { useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Binary,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

export default function EngineeringIntelligence({ onExplore }) {
  const [activeTab, setActiveTab] = useState("github");

  return (
    <section className="eng-intelligence-section" id="ai-evaluation">
      <div className="section-container">
        {/* Section Header */}
        <div className="eng-head-center">
          <div className="kicker-pill mx-auto">
            <Cpu size={14} className="text-emerald-500" />
            <span>AI-POWERED TECHNICAL VETTING ENGINE</span>
          </div>
          <h2 className="section-title text-center">
            Engineered for <span>Engineering Talent.</span>
          </h2>
          <p className="section-desc text-center mx-auto">
            Traditional resumes tell stories. Northstar decodes real technical capability by analyzing code repositories, system architecture depth, and verified production impact.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="eng-tabs-bar" role="tablist" aria-label="Engineering intelligence features">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "github"}
            className={`eng-tab-btn ${activeTab === "github" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("github")}
          >
            <GitPullRequest size={17} />
            <span>GitHub Telemetry & Rigor</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "resume"}
            className={`eng-tab-btn ${activeTab === "resume" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("resume")}
          >
            <FileText size={17} />
            <span>Architecture & Resume Parsing</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "matching"}
            className={`eng-tab-btn ${activeTab === "matching" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("matching")}
          >
            <Binary size={17} />
            <span>Skill Match Vector</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "scorecard"}
            className={`eng-tab-btn ${activeTab === "scorecard" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("scorecard")}
          >
            <ShieldCheck size={17} />
            <span>AI Evaluation Scorecard</span>
          </button>
        </div>

        {/* Interactive Showcase Box */}
        <div className="eng-showcase-panel">
          {/* TAB 1: GITHUB TELEMETRY */}
          {activeTab === "github" && (
            <div className="eng-tab-view tab-view-github">
              <div className="tab-left-col">
                <div className="badge-tech-label">
                  <Terminal size={14} /> REPO TELEMETRY ANALYZER
                </div>
                <h3>Real code, real PR reviews, zero fluff.</h3>
                <p>
                  Northstar continuously indexes public commit histories, PR review depth, test suite rigor, and architectural refactoring patterns. Know before the first call whether an engineer writes clean, maintainable systems.
                </p>

                <div className="telemetry-checklist">
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Code Quality & Clean Architecture:</strong> Automated cyclomatic complexity audit</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>PR Review Velocity:</strong> Evaluates collaboration and code review depth</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Production Test Rigor:</strong> Verifies unit, integration, and fuzz testing</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary-explore mt-6"
                  onClick={onExplore}
                >
                  <span>Explore Verified Roles</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Side Mockup */}
              <div className="tab-right-col">
                <div className="github-card-mockup">
                  <div className="card-mock-header">
                    <div className="user-profile-row">
                      <div className="user-avatar-code">
                        <span>EV</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong>elena-vance.dev</strong>
                          <span className="verified-badge">
                            <CheckCircle2 size={12} /> Verified GitHub
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Top 1% Contributor • Distributed Systems & Go
                        </span>
                      </div>
                    </div>
                    <span className="ai-grade-badge">A+ Code Rigor</span>
                  </div>

                  {/* GitHub Heatmap Grid Simulation */}
                  <div className="heatmap-container">
                    <div className="heatmap-header">
                      <span>1,842 contributions in the last year</span>
                      <span className="text-emerald-500 font-semibold">99.4% PR Merge Rate</span>
                    </div>
                    <div className="heatmap-grid" aria-hidden="true">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <span
                          key={i}
                          className={`heat-cell heat-level-${(i % 5) + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Deep Repos Analyzed */}
                  <div className="repos-analyzed-list">
                    <div className="repo-audit-row">
                      <div className="repo-info">
                        <GitBranch size={14} className="text-emerald-500" />
                        <span className="repo-name">distributed-consensus-engine</span>
                        <span className="repo-lang lang-go">Go</span>
                      </div>
                      <span className="repo-stat">98% Test Coverage</span>
                    </div>

                    <div className="repo-audit-row">
                      <div className="repo-info">
                        <GitCommit size={14} className="text-blue-500" />
                        <span className="repo-name">raft-kv-storage</span>
                        <span className="repo-lang lang-rust">Rust</span>
                      </div>
                      <span className="repo-stat">P99 &lt; 8ms Latency</span>
                    </div>
                  </div>

                  {/* Code Rigor Summary */}
                  <div className="code-metrics-grid">
                    <div className="metric-box">
                      <span className="metric-val">1.2 hrs</span>
                      <span className="metric-sub">Avg. PR Turnaround</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-val">4.8k</span>
                      <span className="metric-sub">OSS Stargazers</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-val">0.02%</span>
                      <span className="metric-sub">Defect Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESUME & ARCHITECTURE PARSING */}
          {activeTab === "resume" && (
            <div className="eng-tab-view tab-view-resume">
              <div className="tab-left-col">
                <div className="badge-tech-label">
                  <FileCode size={14} /> DEEP ARCHITECTURE EXTRACTION
                </div>
                <h3>Extracts architectural scale, not just keywords.</h3>
                <p>
                  Most parsers look for single buzzwords. Northstar's specialized engineering models extract production traffic volumes, database scale, concurrency guarantees, and system bottlenecks resolved.
                </p>

                <div className="telemetry-checklist">
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Scale Detection:</strong> Automatically quantifies QPS, users, and data throughput</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Tech Stack Coherence:</strong> Detects authentic mastery vs superficial keyword stuffing</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>System Leadership:</strong> Identifies architectural RFCs, technical strategy, and mentoring</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary-explore mt-6"
                  onClick={onExplore}
                >
                  <span>See Matched Roles</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Side Resume Parser Mockup */}
              <div className="tab-right-col">
                <div className="resume-parser-mockup">
                  <div className="terminal-header-bar">
                    <span className="term-dot dot-red" />
                    <span className="term-dot dot-yellow" />
                    <span className="term-dot dot-green" />
                    <span className="term-title">northstar-ai-parser --extract-engineering-evidence</span>
                  </div>

                  <div className="parser-code-body">
                    <div className="parser-code-line text-emerald-400">
                      ✓ Successfully parsed: Elena_Vance_Staff_Systems_Engineer.pdf
                    </div>
                    <div className="parser-json-box">
                      <span className="json-key">"engineering_level":</span> <span className="json-str">"Staff / Principal (L6+)"</span>,<br />
                      <span className="json-key">"core_architectures":</span> [<br />
                      &nbsp;&nbsp;<span className="json-str">"Distributed Log-Structured Storage"</span>,<br />
                      &nbsp;&nbsp;<span className="json-str">"Event-Driven Microservices (Kafka, Raft)"</span>,<br />
                      &nbsp;&nbsp;<span className="json-str">"High-Concurrency Async Pipelines"</span><br />
                      ],<br />
                      <span className="json-key">"verified_scale_metrics":</span> &#123;<br />
                      &nbsp;&nbsp;<span className="json-sub-key">"peak_throughput":</span> <span className="json-val">"120,000 QPS"</span>,<br />
                      &nbsp;&nbsp;<span className="json-sub-key">"latency_reduction":</span> <span className="json-val">"43% p99 improvement"</span>,<br />
                      &nbsp;&nbsp;<span className="json-sub-key">"cluster_footprint":</span> <span className="json-val">"850 Kubernetes Nodes"</span><br />
                      &#125;,<br />
                      <span className="json-key">"confidence_score":</span> <span className="json-highlight">0.992</span>
                    </div>

                    <div className="parsed-chips-row">
                      <span className="parsed-tag">Go 1.22</span>
                      <span className="parsed-tag">Kafka</span>
                      <span className="parsed-tag">Kubernetes</span>
                      <span className="parsed-tag">gRPC</span>
                      <span className="parsed-tag">PostgreSQL / Citus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILL MATCH VECTOR */}
          {activeTab === "matching" && (
            <div className="eng-tab-view tab-view-matching">
              <div className="tab-left-col">
                <div className="badge-tech-label">
                  <Binary size={14} /> HIGH-PRECISION ALIGNMENT
                </div>
                <h3>Match based on exact engineering requirements.</h3>
                <p>
                  No more mismatches where a data engineer gets interviewed for a frontend position. Northstar creates multi-dimensional technical embeddings that measure alignment across language depth, distributed guarantees, and team velocity.
                </p>

                <div className="telemetry-checklist">
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Sub-Domain Specialization:</strong> Matches on domain nuance (e.g. low latency vs high throughput)</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Compensation & Equity Parity:</strong> Transparent salary bands verified upfront</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Workstyle & Autonomy:</strong> Aligns team pacing and remote collaboration habits</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary-explore mt-6"
                  onClick={onExplore}
                >
                  <span>Find Your Exact Match</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Side Matching Breakdown */}
              <div className="tab-right-col">
                <div className="vector-match-card">
                  <div className="match-top-banner">
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        MATCH COMPUTATION RESULT
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-1">
                        Staff Distributed Systems Engineer
                      </h4>
                      <p className="text-xs text-slate-500">Stripe Core Platform • $210k – $260k</p>
                    </div>
                    <div className="overall-pct-circle">
                      <span className="pct-num">98.7%</span>
                      <span className="pct-label">FIT INDEX</span>
                    </div>
                  </div>

                  <div className="vector-bars-list">
                    <div className="vector-bar-item">
                      <div className="vector-bar-header">
                        <span>Go & Concurrency Primitives</span>
                        <span className="font-bold text-emerald-600">100% Match</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "100%" }} />
                      </div>
                    </div>

                    <div className="vector-bar-item">
                      <div className="vector-bar-header">
                        <span>Distributed Consensus & Raft</span>
                        <span className="font-bold text-emerald-600">98% Match</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "98%" }} />
                      </div>
                    </div>

                    <div className="vector-bar-item">
                      <div className="vector-bar-header">
                        <span>High-Throughput Kafka Ingestion</span>
                        <span className="font-bold text-emerald-600">97% Match</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "97%" }} />
                      </div>
                    </div>

                    <div className="vector-bar-item">
                      <div className="vector-bar-header">
                        <span>Kubernetes Operator & Cloud Infra</span>
                        <span className="font-bold text-emerald-600">95% Match</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: "95%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="match-status-footer">
                    <span className="status-pill-green">
                      <Sparkles size={13} /> Instant Fast-Track Interview Recommended
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI EVALUATION SCORECARD */}
          {activeTab === "scorecard" && (
            <div className="eng-tab-view tab-view-scorecard">
              <div className="tab-left-col">
                <div className="badge-tech-label">
                  <Activity size={14} /> CANDIDATE ASSESSMENT SCORECARD
                </div>
                <h3>Objective, evidence-backed hiring decisions.</h3>
                <p>
                  Hiring managers get an unbiased technical dossier before the first conversation. Review code benchmarks, architectural trade-offs made in past repositories, and tailored interview questions generated directly from candidate PRs.
                </p>

                <div className="telemetry-checklist">
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Bespoke Interview Prompts:</strong> Dynamic questions tailored to actual past PRs</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Unbiased Technical Evidence:</strong> Focus on demonstrable code and system designs</span>
                  </div>
                  <div className="check-item">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong>Zero Ghosting Pacing:</strong> Direct scheduling straight into engineering calendars</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary-explore mt-6"
                  onClick={onExplore}
                >
                  <span>Browse Open Roles</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Right Side Scorecard Mockup */}
              <div className="tab-right-col">
                <div className="scorecard-mockup">
                  <div className="scorecard-head">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase">
                        EXECUTIVE ENGINEERING REPORT
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Technical Dossier: Elena Vance
                      </h4>
                    </div>
                    <span className="score-badge-circle">98 / 100</span>
                  </div>

                  <div className="scorecard-strengths-box">
                    <span className="font-semibold text-slate-800 text-xs block mb-1">
                      KEY ARCHITECTURAL HIGHLIGHTS
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed m-0">
                      Demonstrates world-class mastery in Go memory optimization and non-blocking I/O. Architected a sub-millisecond telemetry pipeline and led technical reviews across 14 engineers.
                    </p>
                  </div>

                  <div className="scorecard-radar-scores">
                    <div className="score-row">
                      <span>System Architecture & Reliability</span>
                      <span className="score-num font-bold text-emerald-600">99 / 100</span>
                    </div>
                    <div className="score-row">
                      <span>Code Cleanliness & Documentation</span>
                      <span className="score-num font-bold text-emerald-600">97 / 100</span>
                    </div>
                    <div className="score-row">
                      <span>Problem Solving & Concurrency</span>
                      <span className="score-num font-bold text-emerald-600">98 / 100</span>
                    </div>
                    <div className="score-row">
                      <span>Cross-functional Mentorship</span>
                      <span className="score-num font-bold text-emerald-600">95 / 100</span>
                    </div>
                  </div>

                  <div className="suggested-interview-q">
                    <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      💡 Suggested Interview Deep-Dive:
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      "In PR #182 of distributed-consensus, how did you resolve split-brain recovery when network partitions exceeded the heartbeat timeout?"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
