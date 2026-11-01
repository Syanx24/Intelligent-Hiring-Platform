import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  FileCode,
  Filter,
  Flame,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  MapPin,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";

import AuthModal from "../components/AuthModal.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { ApplicationModal, JobDetailsModal } from "../components/candidate/JobModals.jsx";
import { CompanyMark, timeAgo } from "../components/candidate/jobUtils.jsx";
import Improvement from "../features/improvements/Improvement.jsx";
import { getStoredUser, setStoredAuth } from "../service/apiClient.js";
import { submitApplication } from "../service/application/jobApplicationAPI.js";
import { getCurrentUser } from "../service/authAPI.js";
import { getJobs } from "../service/JobList/jobListAPI.js";

// Demo candidates for the Interactive Live Profile Scanner
const DEMO_CANDIDATES = [
  {
    id: "alex",
    handle: "alex-rivera",
    name: "Alex Rivera",
    role: "Staff Eng",
    location: "San Francisco, CA",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    score: 98,
    tier: "Top 0.5% Signal",
    summary: "Staff-Level Code Craft",
    metrics: {
      prThoroughness: "96%",
      prNote: "4.2 notes/PR",
      astCraft: "98%",
      astNote: "Zero debt anti-patterns",
      ghostFilter: "42 bots",
      ghostNote: "Fluff filtered",
    },
    languages: [
      { name: "Rust", pct: 65, color: "#3525cd" },
      { name: "TypeScript", pct: 25, color: "#6063ee" },
      { name: "Go", pct: 10, color: "#71717a" },
    ],
    cadence: "+34% vs peers",
    sparkPoints: "M2 16 L15 11 L30 14 L45 5 L60 12 L75 4 L90 7 L98 2",
    sampleSnippet: `// Zero-allocation async ring buffer driver
pub async fn poll_transmit(&mut self, cx: &mut Context<'_>) -> Poll<Result<usize>> {
    let mut guard = ready!(self.buffer.poll_lock(cx))?;
    guard.flush_unpinned()
}`,
  },
  {
    id: "elena",
    handle: "elena-rs",
    name: "Elena Rostova",
    role: "Systems Core",
    location: "Berlin, Germany",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    score: 96,
    tier: "Top 1% Signal",
    summary: "Kernel & eBPF Observability",
    metrics: {
      prThoroughness: "97%",
      prNote: "5.1 notes/PR",
      astCraft: "97%",
      astNote: "Formal specs verified",
      ghostFilter: "58 bots",
      ghostNote: "CI passes filtered",
    },
    languages: [
      { name: "Go", pct: 70, color: "#3525cd" },
      { name: "Rust", pct: 20, color: "#6063ee" },
      { name: "C++", pct: 10, color: "#71717a" },
    ],
    cadence: "+42% vs peers",
    sparkPoints: "M2 18 L15 14 L30 10 L45 8 L60 6 L75 7 L90 3 L98 1",
    sampleSnippet: `// eBPF kernel memory ring collector
func (p *Probe) AttachRingBuffer(ctx context.Context) error {
    rb, err := ringbuf.NewReader(p.bpfSpec.Maps["events"])
    if err != nil { return fmt.Errorf("rb init: %w", err) }
    defer rb.Close()
    return nil
}`,
  },
  {
    id: "david",
    handle: "dkim-cloud",
    name: "David Kim",
    role: "Senior+ Arch",
    location: "Seattle, WA",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    score: 91,
    tier: "Top 3% Signal",
    summary: "Distributed Web Performance",
    metrics: {
      prThoroughness: "92%",
      prNote: "3.8 notes/PR",
      astCraft: "94%",
      astNote: "Clean boundary decoupling",
      ghostFilter: "35 bots",
      ghostNote: "Dependabot filtered",
    },
    languages: [
      { name: "TypeScript", pct: 60, color: "#3525cd" },
      { name: "Rust", pct: 25, color: "#6063ee" },
      { name: "React", pct: 15, color: "#71717a" },
    ],
    cadence: "+28% vs peers",
    sparkPoints: "M2 17 L15 13 L30 15 L45 9 L60 11 L75 6 L90 5 L98 3",
    sampleSnippet: `// WASM-accelerated diff engine
export function computeVirtualTree(prev: ASTNode, next: ASTNode): Patch[] {
  return wasmModule.reconcile(prev.ptr, next.ptr);
}`,
  },
  {
    id: "marcus",
    handle: "mvance-core",
    name: "Marcus Vance",
    role: "ML Platform",
    location: "New York, NY",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    score: 87,
    tier: "Top 5% Signal",
    summary: "Distributed PyTorch Infra",
    metrics: {
      prThoroughness: "89%",
      prNote: "3.5 notes/PR",
      astCraft: "91%",
      astNote: "Clean CUDA wrappers",
      ghostFilter: "29 bots",
      ghostNote: "Auto-format filtered",
    },
    languages: [
      { name: "Python", pct: 65, color: "#3525cd" },
      { name: "PyTorch", pct: 25, color: "#6063ee" },
      { name: "CUDA", pct: 10, color: "#71717a" },
    ],
    cadence: "+19% vs peers",
    sparkPoints: "M2 19 L15 15 L30 16 L45 12 L60 10 L75 9 L90 7 L98 5",
    sampleSnippet: `// Custom kernel allocation hook
@torch.inference_mode()
def execute_tensor_pipeline(tensor: torch.Tensor, stream: Stream) -> torch.Tensor:
    with torch.cuda.stream(stream):
        return custom_cuda.fast_gemm(tensor)`,
  },
];

const JOB_CATEGORIES = [
  "All roles",
  "Full Stack",
  "Backend",
  "Frontend",
  "AI / Systems",
  "DevOps",
];

export default function LandingPage() {
  const navigate = useNavigate();

  // Auth & User State
  const [auth, setAuth] = useState({ isOpen: false, role: "candidate", oauthError: "" });
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  // Interactive Scanner State
  const [activeCandidateId, setActiveCandidateId] = useState("alex");
  const [customHandle, setCustomHandle] = useState("alex-rivera");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");

  // Job Catalog State
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All roles");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All");

  // Job Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyStatus, setApplyStatus] = useState("idle");
  const [applyError, setApplyError] = useState("");

  const activeCandidate = useMemo(
    () => DEMO_CANDIDATES.find((c) => c.id === activeCandidateId) || DEMO_CANDIDATES[0],
    [activeCandidateId],
  );

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    navigate(user.role === "candidate" ? "/candidate" : "/recruiter", { replace: true });
  };

  // OAuth query param handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauth_token");
    const oauthError = params.get("oauth_error");

    if (oauthToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setStoredAuth(oauthToken, null);
      getCurrentUser().then((user) => {
        if (user) {
          setStoredAuth(oauthToken, user);
          handleAuthSuccess(user);
        }
      });
    } else if (oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuth({ isOpen: true, role: "candidate", oauthError });
    }
  }, []);

  // Fetch Jobs on Mount
  useEffect(() => {
    const controller = new AbortController();
    setLoadingJobs(true);

    getJobs({}, { signal: controller.signal })
      .then((data) => {
        setJobs(Array.isArray(data) ? data : data.jobs || []);
        setJobsError("");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setJobsError(err.message || "Could not load jobs");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingJobs(false);
      });

    return () => controller.abort();
  }, []);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch =
        !searchQuery ||
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "All roles" ||
        job.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchWorkplace =
        selectedWorkplace === "All" ||
        job.workplace?.toLowerCase() === selectedWorkplace.toLowerCase();

      return matchSearch && matchCategory && matchWorkplace;
    });
  }, [jobs, searchQuery, selectedCategory, selectedWorkplace]);

  // Simulated Telemetry Scan
  const runLiveSimulation = () => {
    setIsScanning(true);
    setScanStep("Resolving GitHub AST branches...");

    setTimeout(() => {
      setScanStep("Filtering 42 automated bot & dependency commits...");
    }, 700);

    setTimeout(() => {
      setScanStep("Benchmarking PR debate clarity & test ratios...");
    }, 1400);

    setTimeout(() => {
      setScanStep("Deterministic code signal verified: 98/100");
      setIsScanning(false);
    }, 2100);
  };

  // Submit Job Application Handler
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!applyJob) return;

    setApplyStatus("submitting");
    setApplyError("");

    const formData = new FormData(e.target);
    const payload = {
      jobId: applyJob._id,
      name: formData.get("name"),
      email: formData.get("email"),
      githubUrl: formData.get("githubUrl"),
      resumeUrl: formData.get("resumeUrl") || "",
      coverNote: formData.get("coverNote") || "",
    };

    try {
      await submitApplication(payload);
      setApplyStatus("success");
    } catch (err) {
      setApplyError(err.message || "Failed to submit application. Please try again.");
      setApplyStatus("error");
    }
  };

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#faf9f6] text-[#18181b] antialiased selection:bg-[#4f46e5] selection:text-white">
      {/* 1. Brand Header */}
      <Header onOpenAuth={(role) => setAuth({ isOpen: true, role, oauthError: "" })} />

      <main id="home" className="flex flex-col items-center">
        {/* ==========================================================================
            2. HERO SECTION
            ========================================================================== */}
        <section className="relative w-full px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-20 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-3.5 py-1 text-xs shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4f46e5] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4f46e5]" />
            </span>
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#18181b]">
              AI-POWERED REPO TELEMETRY
            </span>
            <span className="text-[#a1a1aa]">•</span>
            <span className="font-mono text-[11px] font-semibold text-[#4f46e5]">
              12s scan
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-5 max-w-3xl font-sans text-3xl sm:text-5xl md:text-[54px] font-bold tracking-tight text-[#18181b] leading-[1.12]">
            Hire developers based on what they build.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-[15px] sm:text-lg leading-relaxed text-[#52525b]">
            Evaluate deep AST parsing, pull request rigor, and real engineering craftsmanship directly from candidate GitHub profiles. Zero LeetCode trivia.
          </p>

          {/* Dual Action Buttons */}
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setAuth({ isOpen: true, role: "candidate", oauthError: "" })}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#18181b] px-6 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[#27272a] active:scale-[0.98]"
            >
              <span>Analyze GitHub Profile</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#catalog"
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#e4e4e7] bg-white px-6 text-[14px] font-semibold text-[#18181b] shadow-xs transition-colors hover:bg-[#f4f3f0] active:scale-[0.98]"
            >
              <Briefcase size={16} className="text-[#4f46e5]" />
              <span>Browse Open Roles</span>
            </a>
          </div>

          {/* Trust Micro-Proof */}
          <div className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[12px] text-[#71717a]">
            <CheckCircle2 size={14} className="text-[#4f46e5]" />
            <span>No credit card required • Instant GitHub OAuth sync</span>
          </div>

          {/* Social Proof Row */}
          <div className="mt-10 w-full max-w-md border-t border-[#e4e4e7]/60 pt-6">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">
              Trusted by engineering leads at
            </span>
            <div className="mt-3 flex items-center justify-center gap-5 sm:gap-7 flex-wrap font-mono text-[13px] font-semibold text-[#18181b]">
              <div className="flex items-center gap-1.5 hover:text-[#4f46e5] transition-colors">
                <span>▲</span> Vercel
              </div>
              <span className="text-[#d4d4d8]">•</span>
              <div className="flex items-center gap-1.5 hover:text-[#4f46e5] transition-colors">
                <span>⬡</span> Monad
              </div>
              <span className="text-[#d4d4d8]">•</span>
              <div className="flex items-center gap-1.5 hover:text-[#4f46e5] transition-colors">
                <span>⚡</span> Retool
              </div>
              <span className="text-[#d4d4d8]">•</span>
              <div className="flex items-center gap-1.5 hover:text-[#4f46e5] transition-colors">
                <span>✦</span> Supabase
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            3. CREATIVE FEATURE: INTERACTIVE 'LIVE PROFILE SCANNER' PREVIEW WIDGET
            ========================================================================== */}
        <section id="scanner" className="w-full max-w-4xl px-4 pb-16 sm:px-6">
          <div className="flex flex-col items-center text-center mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#4f46e5]">
              Real-Time Repository Telemetry
            </span>
            <h2 className="mt-1 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">
              Live Profile Scanner Preview
            </h2>
            <p className="mt-1.5 text-sm text-[#52525b] max-w-md">
              Select a verified engineer to inspect their deterministic AST telemetry, language distribution, and commit sparkline.
            </p>

            {/* Profile Selection Chips */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {DEMO_CANDIDATES.map((cand) => (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => {
                    setActiveCandidateId(cand.id);
                    setCustomHandle(cand.handle);
                  }}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                    activeCandidateId === cand.id
                      ? "bg-[#18181b] text-white shadow-xs font-semibold"
                      : "border border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#18181b] hover:text-[#18181b]"
                  }`}
                >
                  <img src={cand.avatar} alt={cand.name} className="h-4 w-4 rounded-full object-cover" />
                  <span>{cand.name}</span>
                  <span className="font-mono text-[10px] opacity-75">({cand.score})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dossier Card Container */}
          <div className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-5 sm:p-7 shadow-md">
            {/* Top Terminal Simulator Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0] p-3">
              <div className="flex items-center gap-2 min-w-0">
                <Terminal size={16} className="text-[#52525b] shrink-0" />
                <div className="flex items-center font-mono text-[12px] sm:text-[13px] truncate">
                  <span className="text-[#71717a]">github.com/</span>
                  <span className="font-semibold text-[#4f46e5]">{activeCandidate.handle}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runLiveSimulation}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#18181b] border border-[#e4e4e7] shadow-2xs hover:bg-[#faf9f6] active:scale-95 disabled:opacity-60"
                >
                  <PlayCircle size={13} className="text-[#4f46e5]" />
                  <span>{isScanning ? "Scanning..." : "Simulate 12s Telemetry"}</span>
                </button>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Scanned 4.2s</span>
                </div>
              </div>
            </div>

            {/* Scan Activity Feedback Toast (if running) */}
            {isScanning && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#e0e7ff] p-2.5 font-mono text-[11px] text-[#3525cd] animate-pulse">
                <Sparkles size={14} />
                <span>{scanStep}</span>
              </div>
            )}

            {/* Candidate Header Row */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={activeCandidate.avatar}
                    alt={activeCandidate.name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-[#4f46e5]/20 shadow-xs"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4f46e5] text-[9px] font-bold text-white ring-2 ring-white">
                    ✓
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[18px] font-bold text-[#18181b]">
                      {activeCandidate.name}
                    </span>
                    <span className="rounded bg-[#4f46e5]/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#4f46e5]">
                      {activeCandidate.role}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] text-[#71717a]">
                    @{activeCandidate.handle} · {activeCandidate.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-[#f4f3f0] px-3 py-1.5">
                <ShieldCheck size={16} className="text-[#4f46e5]" />
                <span className="font-mono text-[11px] font-semibold text-[#18181b]">
                  Verified Deterministic Signal
                </span>
              </div>
            </div>

            {/* Radial Score Card */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#e4e4e7] bg-[#f4f3f0]/60 p-4">
              <div className="flex items-center gap-4">
                {/* SVG Radial Meter */}
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                    <circle
                      className="text-[#e4e4e7]"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <circle
                      className="text-[#4f46e5] transition-all duration-700"
                      cx="24"
                      cy="24"
                      fill="none"
                      r="20"
                      stroke="currentColor"
                      strokeDasharray="125.6"
                      strokeDashoffset={125.6 - (125.6 * activeCandidate.score) / 100}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute font-sans text-[16px] font-bold text-[#18181b]">
                    {activeCandidate.score}
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">
                    Overall Signal Score
                  </span>
                  <div className="font-sans text-[15px] font-semibold text-[#18181b]">
                    {activeCandidate.summary}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4f46e5] px-3.5 py-1.5 font-mono text-[11px] font-semibold text-white shadow-xs">
                <span>{activeCandidate.tier}</span>
              </div>
            </div>

            {/* 3-Point Telemetry Breakdown */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-3 text-left">
                <span className="font-mono text-[11px] text-[#71717a]">PR Thoroughness</span>
                <div className="mt-1 font-mono text-[18px] font-bold text-[#18181b]">
                  {activeCandidate.metrics.prThoroughness}
                </div>
                <span className="font-mono text-[10px] text-emerald-600">
                  {activeCandidate.metrics.prNote}
                </span>
              </div>

              <div className="rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-3 text-left">
                <span className="font-mono text-[11px] text-[#71717a]">AST Code Craft</span>
                <div className="mt-1 font-mono text-[18px] font-bold text-[#4f46e5]">
                  {activeCandidate.metrics.astCraft}
                </div>
                <span className="font-mono text-[10px] text-[#4f46e5]">
                  {activeCandidate.metrics.astNote}
                </span>
              </div>

              <div className="rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-3 text-left">
                <span className="font-mono text-[11px] text-[#71717a]">Ghost Commits Filter</span>
                <div className="mt-1 font-mono text-[18px] font-bold text-[#18181b]">
                  {activeCandidate.metrics.ghostFilter}
                </div>
                <span className="font-mono text-[10px] text-[#71717a]">
                  {activeCandidate.metrics.ghostNote}
                </span>
              </div>
            </div>

            {/* Language Breakdown Segmented Bar */}
            <div className="mt-4 border-t border-[#e4e4e7]/60 pt-3">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#71717a]">Language telemetry breakdown</span>
                <span className="font-medium text-[#18181b]">
                  {activeCandidate.languages.map((l) => `${l.name} ${l.pct}%`).join(" · ")}
                </span>
              </div>
              <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-[#f4f3f0]">
                {activeCandidate.languages.map((lang, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
                    className="h-full transition-all duration-500"
                    title={`${lang.name}: ${lang.pct}%`}
                  />
                ))}
              </div>
            </div>

            {/* Commit Cadence Sparkline */}
            <div className="mt-4 flex items-center justify-between border-t border-[#e4e4e7]/60 pt-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] text-[#71717a]">30-day commit cadence</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-24 text-[#4f46e5]" fill="none" viewBox="0 0 100 20">
                  <path
                    d={activeCandidate.sparkPoints}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="98" cy="2" r="2.5" fill="currentColor" />
                </svg>
                <span className="font-mono text-[11px] font-semibold text-emerald-600">
                  {activeCandidate.cadence}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            4. LIVE JOB CATALOG (Real API Integration from Stitch)
            ========================================================================== */}
        <section id="catalog" className="w-full max-w-5xl px-4 py-12 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e4e4e7] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#4f46e5]">
                <Briefcase size={12} />
                <span>Verified Positions</span>
              </div>
              <h2 className="mt-1.5 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">
                Active Engineering Roles
              </h2>
              <p className="mt-1 text-sm text-[#52525b]">
                Every role evaluates verified GitHub signal instead of resume keywords.
              </p>
            </div>

            {/* Quick Count Badge */}
            <div className="flex items-center gap-2 font-mono text-[12px] text-[#52525b]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>{filteredJobs.length} live opportunities available</span>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
                <input
                  type="text"
                  placeholder="Filter by title, company, technology stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#18181b] outline-none shadow-xs transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                />
              </div>

              {/* Workplace Filter Buttons */}
              <div className="flex rounded-xl border border-[#e4e4e7] bg-white p-1 shadow-xs">
                {["All", "Remote", "Hybrid", "On-site"].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWorkplace(w)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                      selectedWorkplace === w
                        ? "bg-[#18181b] text-white shadow-xs font-semibold"
                        : "text-[#71717a] hover:text-[#18181b]"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-nowrap scrollbar-none">
              {JOB_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[#18181b] text-white shadow-xs font-semibold"
                      : "border border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#18181b] hover:text-[#18181b]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Job Card Stream */}
          <div className="mt-6 flex flex-col gap-3.5">
            {loadingJobs ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e4e4e7] bg-white p-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent" />
                <span className="mt-3 font-mono text-[12px] text-[#71717a]">
                  Loading deterministic job stream...
                </span>
              </div>
            ) : jobsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-[13px] text-red-700">
                <p>Failed to load jobs: {jobsError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded-lg bg-red-600 px-3 py-1 font-mono text-[11px] text-white"
                >
                  Retry
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-[#e4e4e7] bg-white p-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f3f0] text-[#71717a]">
                  <Search size={18} />
                </div>
                <h3 className="mt-2 font-sans text-[15px] font-semibold text-[#18181b]">
                  No matching roles found
                </h3>
                <p className="mt-1 text-[13px] text-[#71717a]">
                  Try clearing your search query or switching to another category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All roles");
                    setSelectedWorkplace("All");
                  }}
                  className="mt-3 rounded-lg border border-[#e4e4e7] bg-[#f4f3f0] px-3.5 py-1.5 font-mono text-[11px] font-medium text-[#18181b]"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <article
                  key={job._id || job.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs transition-all hover:border-[#18181b]/30 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Company Logo & Details */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <CompanyMark job={job} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans text-[16px] font-semibold text-[#18181b] group-hover:text-[#4f46e5] transition-colors truncate">
                            {job.title}
                          </span>
                          <span className="rounded-full bg-[#f4f3f0] px-2 py-0.5 font-mono text-[10px] font-medium text-[#52525b] border border-[#e4e4e7]/60">
                            {job.workplace || "Remote"}
                          </span>
                        </div>

                        {/* Company & Meta info */}
                        <div className="mt-1 flex items-center gap-2 flex-wrap text-[12px] text-[#52525b]">
                          <span className="font-medium text-[#18181b]">{job.company}</span>
                          <span className="text-[#d4d4d8]">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#71717a]" />
                            <span>{job.location || "Remote"}</span>
                          </span>
                          {job.salary && (
                            <>
                              <span className="text-[#d4d4d8]">•</span>
                              <span className="font-semibold text-emerald-600 font-mono text-[11px]">
                                {job.salary}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Rubric Description */}
                        {job.description && (
                          <p className="mt-2 text-[13px] leading-relaxed text-[#71717a] line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        {/* Skill Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                            {job.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded-md border border-[#e4e4e7]/60 bg-[#f4f3f0] px-2 py-0.5 font-mono text-[10px] text-[#52525b]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-[#e4e4e7]/50 sm:border-t-0">
                      <span className="font-mono text-[11px] text-[#71717a] flex items-center gap-1">
                        <Clock size={12} />
                        <span>{timeAgo(job.createdAt)}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="rounded-lg border border-[#e4e4e7] bg-white px-3 py-1.5 text-[12px] font-medium text-[#18181b] shadow-2xs hover:bg-[#f4f3f0] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser) {
                              setAuth({ isOpen: true, role: "candidate", oauthError: "" });
                            } else {
                              setApplyJob(job);
                              setApplyStatus("idle");
                              setApplyError("");
                            }
                          }}
                          className="rounded-lg bg-[#18181b] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs hover:bg-[#27272a] active:scale-95 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>


        {/* ==========================================================================
            6. COMPARISON MATRIX (Traditional Hiring vs. HireMe Signal)
            ========================================================================== */}
        <section id="comparison" className="w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="text-left mb-6">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#4f46e5]">
              Why Teams Switch
            </span>
            <h2 className="mt-1 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">
              Traditional Hiring vs. HireMe Signal
            </h2>
            <p className="mt-1 text-sm text-[#52525b]">
              Stop filtering on puzzle agility. Start evaluating production capability.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-4 sm:p-6 shadow-xs flex flex-col gap-3">
            {/* Comparison Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-4">
              <div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-rose-600">
                  <span>✕</span> Traditional Hiring
                </span>
                <p className="mt-1 text-[13px] font-medium text-[#18181b]">
                  60-minute LeetCode binary tree puzzles and algorithmic trivia
                </p>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-[#e4e4e7] pt-3 sm:pt-0 sm:pl-4">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#4f46e5]">
                  <span>✓</span> HireMe Signal
                </span>
                <p className="mt-1 text-[13px] font-semibold text-[#18181b]">
                  Instant GitHub deep-dive and AST parsing in 12 seconds
                </p>
              </div>
            </div>

            {/* Comparison Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-4">
              <div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-rose-600">
                  <span>✕</span> Resume Screening
                </span>
                <p className="mt-1 text-[13px] font-medium text-[#18181b]">
                  Keyword stuffing, buzzword inflation, and unverifiable claims
                </p>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-[#e4e4e7] pt-3 sm:pt-0 sm:pl-4">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#4f46e5]">
                  <span>✓</span> AST Craft Verification
                </span>
                <p className="mt-1 text-[13px] font-semibold text-[#18181b]">
                  Verified commit history, production refactors, and clean architecture
                </p>
              </div>
            </div>

            {/* Comparison Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e4e4e7]/70 bg-[#f4f3f0]/60 p-4">
              <div>
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-rose-600">
                  <span>✕</span> Outcome
                </span>
                <p className="mt-1 text-[13px] font-medium text-[#18181b]">
                  45% false positive interview rate and high engineer burnout
                </p>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-[#e4e4e7] pt-3 sm:pt-0 sm:pl-4">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#4f46e5]">
                  <span>✓</span> Outcome
                </span>
                <p className="mt-1 text-[13px] font-semibold text-[#18181b]">
                  Zero resume inflation · 75% faster interview cycles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            7. EXECUTIVE TESTIMONIAL (Elena Thorne)
            ========================================================================== */}
        <section className="w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-1 text-[#4f46e5]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="mt-3 font-sans text-base sm:text-lg italic leading-relaxed text-[#18181b]">
              “HireMe cut our technical screening cycle by 75% without false positives. We evaluate how candidates actually write tests and architect distributed systems, not how they memorize textbook sorting algorithms.”
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-[#e4e4e7]/60 pt-3">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Elena Thorne"
                className="h-10 w-10 rounded-full object-cover ring-1 ring-[#e4e4e7]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[13px] font-semibold text-[#18181b]">
                    Elena Thorne
                  </span>
                  <CheckCircle2 size={13} className="text-[#4f46e5]" />
                </div>
                <span className="font-mono text-[11px] text-[#71717a]">
                  VP of Engineering, Monad Systems
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            8. BOTTOM CONVERSION CTA BANNER
            ========================================================================== */}
        <section className="w-full max-w-5xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center rounded-2xl border border-[#e4e4e7] bg-white p-8 sm:p-12 text-center shadow-md">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4f46e5] font-mono text-xl font-bold text-white shadow-sm">
              λ
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">
              Turn GitHub into your unfair hiring advantage.
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#52525b] leading-relaxed">
              Start evaluating candidate repositories today. Zero manual screening, instant AST telemetry verification.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setAuth({ isOpen: true, role: "candidate", oauthError: "" })}
                className="flex items-center gap-2 rounded-full bg-[#18181b] px-6 py-3.5 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-[#27272a] active:scale-[0.98]"
              >
                <span>Get Started for Free</span>
                <ArrowRight size={16} />
              </button>
              <span className="font-mono text-[11px] text-[#71717a]">
                No credit card required · Instant GitHub sync
              </span>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            9. PLATFORM IMPROVEMENTS / ROADMAP SECTION
            ========================================================================== */}
        <section id="roadmap" className="w-full max-w-5xl px-4 pb-16 sm:px-6" aria-label="Community roadmap">
          <Improvement />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={auth.isOpen}
        initialRole={auth.role}
        initialError={auth.oauthError || ""}
        onClose={() => setAuth((current) => ({ ...current, isOpen: false, oauthError: "" }))}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => {
            const jobToApply = selectedJob;
            setSelectedJob(null);
            if (!currentUser) {
              setAuth({ isOpen: true, role: "candidate", oauthError: "" });
            } else {
              setApplyJob(jobToApply);
              setApplyStatus("idle");
              setApplyError("");
            }
          }}
        />
      )}

      {/* Job Application Modal */}
      {applyJob && (
        <ApplicationModal
          job={applyJob}
          user={currentUser}
          status={applyStatus}
          error={applyError}
          onClose={() => setApplyJob(null)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}
