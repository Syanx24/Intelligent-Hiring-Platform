import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  Github,
  Globe,
  Lock,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  clearStoredAuth,
  getJobs,
  getMyApplications,
  loginUser,
  registerUser,
  submitApplication,
  updateUserProfile,
} from "../service/apiCall.js";
import { timeAgo } from "../components/JobSections.jsx";
import { ApplicationModal, JobDetailsModal } from "../components/JobModals.jsx";

const statusBadges = {
  Applied: "badge-status-blue",
  "Under review": "badge-status-amber",
  Interviewing: "badge-status-purple",
  Accepted: "badge-status-emerald",
  Rejected: "badge-status-rose",
  New: "badge-status-blue",
  Reviewing: "badge-status-amber",
  Interview: "badge-status-purple",
  Hired: "badge-status-emerald",
};

const CATEGORIES = [
  "All roles",
  "Full Stack",
  "Backend",
  "Frontend",
  "AI & Data",
  "DevOps & Cloud",
  "Mobile",
];

const WORKPLACES = ["All", "Remote", "Hybrid", "On-site"];

export default function CandidatePortalPage({
  user,
  onUserUpdate,
  onNavigateHome,
  onLogout,
  onOpenGlobalJobModal,
}) {
  // If not logged in as candidate, show the Candidate Login & Registration Portal
  const isCandidate = Boolean(user && user.role === "candidate");

  // Portal Login/Register State
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authHeadline, setAuthHeadline] = useState("");
  const [authGithubUrl, setAuthGithubUrl] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessNotice, setAuthSuccessNotice] = useState("");

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "applications" | "profile"

  // Dashboard Jobs State
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All roles");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All");

  // Dashboard Applications State
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");

  // Modals for Jobs
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [applyState, setApplyState] = useState("idle");
  const [applyErrorMsg, setApplyErrorMsg] = useState("");

  // Candidate Profile State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileHeadline, setProfileHeadline] = useState(user?.headline || "");
  const [profileGithub, setProfileGithub] = useState(user?.githubUrl || "");
  const [profilePortfolio, setProfilePortfolio] = useState(user?.portfolioUrl || "");
  const [profileResume, setProfileResume] = useState(user?.resumeUrl || "");
  const [profileLocation, setProfileLocation] = useState(user?.location || "");
  const [profileExp, setProfileExp] = useState(user?.experienceYears || 0);
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [profileSkillsText, setProfileSkillsText] = useState((user?.skills || []).join(", "));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Sync profile form when user object updates
  useEffect(() => {
    if (user && user.role === "candidate") {
      setProfileName(user.name || "");
      setProfileHeadline(user.headline || "");
      setProfileGithub(user.githubUrl || "");
      setProfilePortfolio(user.portfolioUrl || "");
      setProfileResume(user.resumeUrl || "");
      setProfileLocation(user.location || "");
      setProfileExp(user.experienceYears || 0);
      setProfileBio(user.bio || "");
      setProfileSkillsText((user.skills || []).join(", "));
    }
  }, [user]);

  // Load jobs when candidate portal is active
  const fetchPortalJobs = async () => {
    setJobsLoading(true);
    setJobsError("");
    try {
      const data = await getJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setJobsError(err.message || "Failed to load engineering jobs.");
    } finally {
      setJobsLoading(false);
    }
  };

  // Load applications
  const fetchPortalApplications = async () => {
    if (!isCandidate) return;
    setAppsLoading(true);
    setAppsError("");
    try {
      const apps = await getMyApplications();
      setApplications(Array.isArray(apps) ? apps : []);
    } catch (err) {
      setAppsError(err.message || "Could not load your applications.");
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalJobs();
  }, []);

  useEffect(() => {
    if (isCandidate) {
      fetchPortalApplications();
    }
  }, [isCandidate]);

  // Handle Candidate Login & Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessNotice("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await loginUser({
          email: authEmail,
          password: authPassword,
          role: "candidate",
        });
        onUserUpdate(res.user, `Welcome back to your candidate dashboard, ${res.user.name}!`);
      } else {
        const res = await registerUser({
          name: authName,
          email: authEmail,
          password: authPassword,
          role: "candidate",
          headline: authHeadline,
          githubUrl: authGithubUrl,
        });
        onUserUpdate(res.user, `Welcome to Northstar! Your candidate account is active.`);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please verify your details.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick-fill test candidate credentials for demo convenience
  const handleFillDemoCandidate = () => {
    setAuthMode("login");
    setAuthEmail("dev.candidate@northstar.internal");
    setAuthPassword("Northstar@2026");
  };

  // Map of applied job IDs for quick lookup in job listing
  const appliedJobIdsMap = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      const jobId = app.job?._id || app.job;
      if (jobId) {
        map.set(String(jobId), app.status);
      }
    });
    return map;
  }, [applications]);

  // Filtered jobs list
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesCategory =
        selectedCategory === "All roles" || job.category === selectedCategory;
      const matchesWorkplace =
        selectedWorkplace === "All" || job.workplace === selectedWorkplace;
      const matchesSearch =
        !searchTerm.trim() ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.tags || []).some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      return matchesCategory && matchesWorkplace && matchesSearch;
    });
  }, [jobs, selectedCategory, selectedWorkplace, searchTerm]);

  // Profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      const skillsArray = profileSkillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateUserProfile({
        name: profileName,
        headline: profileHeadline,
        githubUrl: profileGithub,
        portfolioUrl: profilePortfolio,
        resumeUrl: profileResume,
        location: profileLocation,
        experienceYears: Number(profileExp) || 0,
        bio: profileBio,
        skills: skillsArray,
      });

      onUserUpdate(updated, "Candidate dossier successfully updated!");
      setProfileSuccess("Your profile changes have been saved.");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.message || "Failed to save profile changes.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Quick Apply submit
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setApplyState("submitting");
    setApplyErrorMsg("");
    const form = new FormData(e.currentTarget);

    try {
      await submitApplication({
        jobId: applyJob._id,
        name: form.get("name"),
        email: form.get("email"),
        githubUrl: form.get("githubUrl"),
        resumeUrl: form.get("resumeUrl"),
        message: form.get("message"),
      });
      setApplyState("success");
      // Refresh applications list
      fetchPortalApplications();
    } catch (err) {
      setApplyState("idle");
      setApplyErrorMsg(err.message || "Failed to submit application.");
    }
  };

  // Calculate profile completion percentage
  const profileCompletionScore = useMemo(() => {
    if (!user) return 0;
    let score = 20; // base score for account
    if (user.headline) score += 20;
    if (user.githubUrl) score += 20;
    if (user.resumeUrl) score += 15;
    if (user.skills && user.skills.length > 0) score += 15;
    if (user.bio) score += 10;
    return Math.min(100, score);
  }, [user]);

  // Statistics for Candidate Dashboard
  const stats = useMemo(() => {
    const total = applications.length;
    const inReview = applications.filter(
      (a) => a.status === "Under review" || a.status === "Reviewing",
    ).length;
    const interviewing = applications.filter(
      (a) => a.status === "Interviewing" || a.status === "Interview",
    ).length;
    const accepted = applications.filter(
      (a) => a.status === "Accepted" || a.status === "Hired",
    ).length;

    return { total, inReview, interviewing, accepted };
  }, [applications]);

  /* =========================================================================
     VIEW 1: CANDIDATE LOGIN & REGISTRATION HUB (when unauthenticated or company)
     ========================================================================= */
  if (!isCandidate) {
    return (
      <div className="candidate-portal-page min-h-screen bg-[#f8faf9] text-[#0f172a] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Top Back Nav */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e2e8f0]">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
            >
              <Compass size={18} className="text-emerald-600" />
              <span>← Back to Main Platform</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                Candidate Gateway
              </span>
            </div>
          </div>

          {/* If logged in as company, prompt switch */}
          {user && user.role === "company" && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 size={20} className="text-amber-700 shrink-0" />
                <span className="text-sm">
                  You are currently signed in as <strong>{user.companyName || user.name}</strong> (Employer).
                  Please sign out to access the candidate portal.
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Grid layout: Left feature showcase, Right Auth Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Value Proposition & Teaser */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <Sparkles size={14} />
                <span>INTELLIGENT CANDIDATE ECOSYSTEM</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your Engineering Career, <br />
                <span className="text-emerald-600">Fast-Tracked by Real Code.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Sign in to your candidate dashboard to track applications in real-time,
                showcase your GitHub code telemetry, and match with verified engineering teams.
              </p>

              {/* 3 Key Candidate Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Live Application Tracking</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    View real-time status updates directly from hiring engineering leaders without email ping-pong.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <Github size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">GitHub Verified Telemetry</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Let your commits, PRs, and software architectures speak louder than keyword-stuffed resumes.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Curated Engineering Roles</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Access verified openings from high-velocity startups and established engineering cultures.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Direct 1-Click Applications</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Apply to verified roles in seconds with your pre-vetted profile, dossier, and repository links.
                  </p>
                </div>
              </div>

              {/* Quick stats banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Top Tech Opportunities
                    </h4>
                    <p className="text-xs text-slate-300">
                      {jobs.length > 0 ? `${jobs.length} active engineering roles currently open` : "Active tech positions"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition"
                >
                  <span>Browse as Guest</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Column: Candidate Auth Box */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#c4f042] text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {authMode === "login" ? "Candidate Sign In" : "Create Candidate Account"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {authMode === "login"
                      ? "Access your dashboard, tracked applications & job listings."
                      : "Join Northstar to get direct access to tech roles and engineering teams."}
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      authMode === "login"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      authMode === "register"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Register New Candidate
                  </button>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === "register" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative flex items-center">
                        <User size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Maya Lin"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="candidate@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                      />
                    </div>
                  </div>

                  {authMode === "register" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Engineering Headline / Role
                        </label>
                        <div className="relative flex items-center">
                          <Briefcase size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={authHeadline}
                            onChange={(e) => setAuthHeadline(e.target.value)}
                            placeholder="e.g. Senior Full Stack Engineer (React, Node, Go)"
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          GitHub Profile URL <span className="text-emerald-600 font-semibold">(Recommended)</span>
                        </label>
                        <div className="relative flex items-center">
                          <Github size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="url"
                            value={authGithubUrl}
                            onChange={(e) => setAuthGithubUrl(e.target.value)}
                            placeholder="https://github.com/username"
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>
                      {authLoading
                        ? "Connecting..."
                        : authMode === "login"
                        ? "Enter Candidate Dashboard"
                        : "Create Account & Go to Dashboard"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                {/* Footer Switch & Demo Helper */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center">
                  <p className="text-xs text-slate-500">
                    {authMode === "login" ? (
                      <>
                        New here?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setAuthError("");
                          }}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Create candidate dossier
                        </button>
                      </>
                    ) : (
                      <>
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setAuthError("");
                          }}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          Sign in to your dashboard
                        </button>
                      </>
                    )}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleFillDemoCandidate}
                      className="text-xs text-slate-400 hover:text-slate-700 underline transition"
                    >
                      Fill Demo Candidate Credentials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: CANDIDATE DASHBOARD (Logged-In Candidate Experience)
     ========================================================================= */
  return (
    <div className="candidate-dashboard-page min-h-screen bg-[#f8faf9] text-[#0f172a] pb-20">
      {/* Top Banner / Candidate Dossier Bar */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Top navigation row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
              >
                <Compass size={14} className="text-emerald-600" />
                <span>Public Site</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Candidate Dashboard
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchPortalJobs();
                  fetchPortalApplications();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition"
                title="Refresh listings and applications"
              >
                <RefreshCw size={13} className={jobsLoading || appsLoading ? "animate-spin" : ""} />
                <span>Refresh Data</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Candidate Profile Dossier Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#c4f042] text-slate-950 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "CD"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    {user.name || "Tech Candidate"}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 size={12} /> Verified Candidate
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  {user.headline || "Engineering Candidate • Software Engineer"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  {user.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" /> {user.location}
                    </span>
                  )}
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <Github size={12} /> GitHub Profile <ExternalLink size={10} />
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      <Globe size={12} /> Portfolio <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Strength & Edit Button */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 border-slate-700 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <div className="text-xs text-slate-400 font-semibold mb-1">
                  Profile Completeness: <strong className="text-emerald-400">{profileCompletionScore}%</strong>
                </div>
                <div className="w-36 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${profileCompletionScore}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 px-4 py-2 rounded-xl transition shadow-sm"
              >
                Edit Technical Dossier
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Applications Sent
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{stats.total}</span>
                <span className="text-xs text-slate-400">tracked</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Under Review
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-amber-600">{stats.inReview}</span>
                <span className="text-xs text-slate-400">reviewing</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block mb-1">
                Interviewing / Offers
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-purple-600">
                  {stats.interviewing + stats.accepted}
                </span>
                <span className="text-xs text-slate-400">advanced</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                Open Roles
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-600">{jobs.length}</span>
                <span className="text-xs text-slate-400">positions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Navigation Tabs */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`inline-flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "jobs"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase size={17} />
            <span>Job Listings & Recommendations</span>
            <span className="text-xs bg-slate-200 text-slate-700 font-extrabold px-2 py-0.5 rounded-full">
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`inline-flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "applications"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={17} />
            <span>My Tracked Applications</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === "profile"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <User size={17} />
            <span>My Technical Profile & Resume</span>
          </button>
        </div>

        {/* ===================================================================
           TAB 1: JOB LISTINGS INSIDE CANDIDATE PORTAL
           =================================================================== */}
        {activeTab === "jobs" && (
          <section className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Field */}
              <div className="relative w-full md:w-80 flex items-center">
                <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search role, skills, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Workplace Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Workplace:</span>
                {WORKPLACES.map((wp) => (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => setSelectedWorkplace(wp)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                      selectedWorkplace === wp
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {wp}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Jobs List / Grid */}
            {jobsLoading ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-600" />
                <p className="text-sm font-medium">Scanning open engineering opportunities...</p>
              </div>
            ) : jobsError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                <p className="font-bold mb-1">Error loading jobs</p>
                <p>{jobsError}</p>
                <button
                  type="button"
                  onClick={fetchPortalJobs}
                  className="mt-3 text-xs font-bold text-rose-900 bg-rose-200 hover:bg-rose-300 px-3 py-1.5 rounded-lg transition"
                >
                  Try Again
                </button>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => {
                  const appliedStatus = appliedJobIdsMap.get(String(job._id));
                  const isApplied = Boolean(appliedStatus);

                  return (
                    <div
                      key={job._id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Company & Applied Tag */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: job.companyColor || "#059669" }}
                            >
                              {job.companyInitials || job.company.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                                {job.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-semibold">{job.company}</p>
                            </div>
                          </div>

                          {isApplied && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check size={12} /> Applied ({appliedStatus})
                            </span>
                          )}
                        </div>

                        {/* Location, Salary, Category */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {job.location} ({job.workplace})
                          </span>
                          <span>·</span>
                          <span className="font-bold text-emerald-700">{job.salary}</span>
                          <span>·</span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {job.category}
                          </span>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {job.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {job.tags.length > 4 && (
                              <span className="text-[11px] font-semibold text-slate-400 px-1 py-0.5">
                                +{job.tags.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                        >
                          <Eye size={14} />
                          <span>View Full Job Spec</span>
                        </button>

                        {isApplied ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("applications")}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg transition"
                          >
                            <span>Track Application</span>
                            <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJob(null);
                              setApplyJob(job);
                              setApplyState("idle");
                              setApplyErrorMsg("");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-sm hover:shadow"
                          >
                            <span>Fast Apply</span>
                            <ArrowUpRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
                <Briefcase size={36} className="mx-auto mb-3 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No roles matched your filters</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Try adjusting your keywords or clearing the category and workplace filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All roles");
                    setSelectedWorkplace("All");
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
           TAB 2: MY TRACKED APPLICATIONS
           =================================================================== */}
        {activeTab === "applications" && (
          <section className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application Pipeline</h2>
                <p className="text-xs text-slate-500">
                  Real-time status updates directly from employer review teams.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchPortalApplications}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
              >
                <RefreshCw size={12} className={appsLoading ? "animate-spin" : ""} />
                <span>Sync Status</span>
              </button>
            </div>

            {appsLoading ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-600" />
                <p className="text-sm font-medium">Fetching your application dossier...</p>
              </div>
            ) : appsError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                <p className="font-bold mb-1">Failed to load applications</p>
                <p>{appsError}</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => {
                  const job = app.job || {};
                  const badgeClass = statusBadges[app.status] || "badge-status-blue";

                  return (
                    <div
                      key={app._id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: job.companyColor || "#059669" }}
                        >
                          {job.companyInitials || (job.company ? job.company.slice(0, 3).toUpperCase() : "JOB")}
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 text-base leading-snug">
                            {job.title || "Engineering Position"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-800">{job.company || "Hiring Team"}</span>
                            {job.location && (
                              <>
                                <span>·</span>
                                <span>{job.location} ({job.workplace})</span>
                              </>
                            )}
                            {job.salary && (
                              <>
                                <span>·</span>
                                <span className="font-bold text-emerald-600">{job.salary}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 pt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={12} /> Applied {timeAgo(app.createdAt)}
                            </span>
                            {app.githubUrl && (
                              <a
                                href={app.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
                              >
                                <Github size={12} /> GitHub attached
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className={`status-pill-badge ${badgeClass}`}>
                          {app.status}
                        </span>
                        {job._id && (
                          <button
                            type="button"
                            onClick={() => setSelectedJob(job)}
                            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                            title="View job description"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
                <FileText size={36} className="mx-auto mb-3 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No applications submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  Browse our open roles and apply with 1 click using your candidate profile and GitHub dossier.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl shadow-md transition"
                >
                  <Briefcase size={14} />
                  <span>Explore Engineering Opportunities</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
           TAB 3: MY TECHNICAL PROFILE & RESUME
           =================================================================== */}
        {activeTab === "profile" && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
            <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Candidate Technical Dossier</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Keep your technical profile, stack, and GitHub telemetry synchronized for engineering recruiters.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {profileCompletionScore}% Complete
              </span>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA (or Remote)"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Engineering Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staff Backend Engineer • Go, Distributed Systems, Raft"
                  value={profileHeadline}
                  onChange={(e) => setProfileHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    GitHub Profile Link *
                  </label>
                  <div className="relative flex items-center">
                    <Github size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileGithub}
                      onChange={(e) => setProfileGithub(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Portfolio / Website URL
                  </label>
                  <div className="relative flex items-center">
                    <Globe size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://yourwebsite.dev"
                      value={profilePortfolio}
                      onChange={(e) => setProfilePortfolio(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Resume / CV Document URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or ReadCV"
                    value={profileResume}
                    onChange={(e) => setProfileResume(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Engineering Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profileExp}
                    onChange={(e) => setProfileExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Core Skills & Technologies <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Node.js, Go, Kubernetes, PostgreSQL, GraphQL"
                  value={profileSkillsText}
                  onChange={(e) => setProfileSkillsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Engineering Bio / Architectural Interests
                </label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe what challenges you enjoy solving, notable systems you've built, or open source projects..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition resize-y"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <span>{profileSaving ? "Saving Changes..." : "Save Dossier"}</span>
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Public & Detail Modals for Job Interaction */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={() => {
          const target = selectedJob;
          setSelectedJob(null);
          setApplyJob(target);
          setApplyState("idle");
          setApplyErrorMsg("");
        }}
      />

      <ApplicationModal
        job={applyJob}
        user={user}
        status={applyState}
        error={applyErrorMsg}
        onClose={() => setApplyJob(null)}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
}
