import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GitBranch,
  Github,
  Globe,
  Layers,
  Lock,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
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
  Applied: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    label: "Applied",
    step: 1,
  },
  "Under review": {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Under Review",
    step: 2,
  },
  Reviewing: {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Reviewing",
    step: 2,
  },
  Interviewing: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    label: "Interviewing",
    step: 3,
  },
  Interview: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    label: "Interviewing",
    step: 3,
  },
  Accepted: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Accepted / Offer",
    step: 4,
  },
  Hired: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Hired",
    step: 4,
  },
  Rejected: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    label: "Decision Made",
    step: 4,
  },
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

const PIPELINE_STEPS = ["Applied", "Under Review", "Interviewing", "Offer / Decision"];

export default function CandidatePortalPage({
  user,
  onUserUpdate,
  onNavigateHome,
  onLogout,
  onOpenGlobalJobModal,
}) {
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
  const [skillsList, setSkillsList] = useState(user?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState("");
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
      setSkillsList(user.skills || []);
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
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const res = await loginUser({
          email: authEmail,
          password: authPassword,
          role: "candidate",
        });
        onUserUpdate(res.user, `Welcome back, ${res.user.name}!`);
      } else {
        const res = await registerUser({
          name: authName,
          email: authEmail,
          password: authPassword,
          role: "candidate",
          headline: authHeadline,
          githubUrl: authGithubUrl,
        });
        onUserUpdate(res.user, `Account registered! Welcome to Northstar, ${res.user.name}.`);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please verify your credentials.");
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

  // Add a skill tag
  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !skillsList.includes(clean)) {
      setSkillsList([...skillsList, clean]);
      setNewSkillInput("");
    }
  };

  // Remove a skill tag
  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  // Profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      const updated = await updateUserProfile({
        name: profileName,
        headline: profileHeadline,
        githubUrl: profileGithub,
        portfolioUrl: profilePortfolio,
        resumeUrl: profileResume,
        location: profileLocation,
        experienceYears: Number(profileExp) || 0,
        bio: profileBio,
        skills: skillsList,
      });

      onUserUpdate(updated, "Profile dossier saved.");
      setProfileSuccess("Your technical dossier has been updated.");
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
      fetchPortalApplications();
    } catch (err) {
      setApplyState("idle");
      setApplyErrorMsg(err.message || "Failed to submit application.");
    }
  };

  // Profile completeness calculation
  const profileCompletion = useMemo(() => {
    if (!user) return { score: 0, items: [] };
    const items = [
      { label: "Account created", done: true, weight: 20 },
      { label: "Engineering headline", done: Boolean(user.headline), weight: 20 },
      { label: "GitHub profile link", done: Boolean(user.githubUrl), weight: 20 },
      { label: "Technical skills tags", done: Boolean(user.skills && user.skills.length > 0), weight: 20 },
      { label: "Resume link", done: Boolean(user.resumeUrl), weight: 10 },
      { label: "Engineering bio", done: Boolean(user.bio), weight: 10 },
    ];
    const score = items.reduce((acc, curr) => (curr.done ? acc + curr.weight : acc), 0);
    return { score, items };
  }, [user]);

  // Statistics
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
     VIEW 1: CANDIDATE LOGIN & REGISTRATION SITE
     Ultra-minimalistic, high-impact, professional aesthetic for tech talent
     ========================================================================= */
  if (!isCandidate) {
    return (
      <div className="min-h-screen bg-[#fafbfc] text-[#0f172a] antialiased">
        {/* Top Minimal Utility Bar */}
        <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <Compass size={15} className="text-emerald-600" />
              <span>Northstar Platform</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">Candidate Gateway</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Engineering Hiring Active
              </span>
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Browse Public Jobs →
              </button>
            </div>
          </div>
        </div>

        {/* Employer alert if logged in as company */}
        {user && user.role === "company" && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between text-amber-900 text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-amber-700 shrink-0" />
                <span>
                  Signed in as <strong>{user.companyName || user.name}</strong> (Employer). Switch to candidate mode by signing out.
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="font-bold underline text-amber-900 hover:text-amber-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Split Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Minimalist Value Presentation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <Sparkles size={13} className="text-emerald-600" />
                <span>CANDIDATE RECRUITMENT SUITE</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Verified code. <br />
                Direct engineering access. <br />
                <span className="text-emerald-600">No recruiter runarounds.</span>
              </h1>

              <p className="text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                Northstar connects software engineers with high-velocity teams through real GitHub telemetry, structured technical profiles, and real-time application pipelines.
              </p>

              {/* Minimal Value Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                    <FileCheck2 size={17} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Direct Pipeline Status</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Track your dossier live from review to technical interview without opaque wait times.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center mb-3">
                    <Github size={17} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">GitHub Verified Telemetry</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Highlight your actual PR contributions, commit frequency, and software architectures.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                    <Zap size={17} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">1-Click Fast Apply</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Apply to verified engineering positions instantly using your synchronized candidate dossier.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 transition">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                    <Briefcase size={17} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Curated Tech Roles</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Transparent salary ranges, verified tech stacks, and direct access to engineering hiring leads.
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="pt-2 flex items-center gap-6 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> Transparent Compensation
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> No Spam Outreach
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> Free for Engineers
                </span>
              </div>
            </div>

            {/* Right Column: Clean Auth Card */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative">
                {/* Mode Selector */}
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                      authMode === "login"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Candidate Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                      authMode === "register"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <div className="mb-5">
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
                    {authMode === "login" ? "Welcome back" : "Create candidate profile"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {authMode === "login"
                      ? "Enter your credentials to access your dashboard and tracked roles."
                      : "Start matching with tech teams using your verified code telemetry."}
                  </p>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authMode === "register" && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <div className="relative flex items-center">
                        <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. Alex Rivera"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Password *
                    </label>
                    <div className="relative flex items-center">
                      <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                      />
                    </div>
                  </div>

                  {authMode === "register" && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Role Title / Specialization
                        </label>
                        <div className="relative flex items-center">
                          <Briefcase size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={authHeadline}
                            onChange={(e) => setAuthHeadline(e.target.value)}
                            placeholder="e.g. Senior Full-Stack Engineer (TypeScript, Go)"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          GitHub Profile URL <span className="text-emerald-600 font-semibold">(Recommended)</span>
                        </label>
                        <div className="relative flex items-center">
                          <Github size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="url"
                            value={authGithubUrl}
                            onChange={(e) => setAuthGithubUrl(e.target.value)}
                            placeholder="https://github.com/username"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-slate-950 hover:bg-slate-900 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-2"
                  >
                    <span>
                      {authLoading
                        ? "Verifying..."
                        : authMode === "login"
                        ? "Sign In to Candidate Dashboard"
                        : "Create Candidate Profile"}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                {/* Demo auto-fill helper */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px]">Testing as reviewer?</span>
                  <button
                    type="button"
                    onClick={handleFillDemoCandidate}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md transition"
                  >
                    ⚡ Fill Demo Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: CANDIDATE DASHBOARD
     Minimalistic, high-density, professional layout for tech candidates
     ========================================================================= */
  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#0f172a] pb-24 antialiased">
      {/* Top Dossier Subbar */}
      <section className="bg-white border-b border-slate-200/90 pt-6 pb-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb & Navigation Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onNavigateHome}
                className="font-medium text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5"
              >
                <Compass size={14} className="text-emerald-600" />
                <span>Public Site</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900">Candidate Dashboard</span>
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Candidate
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  fetchPortalJobs();
                  fetchPortalApplications();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition"
                title="Refresh listings and applications"
              >
                <RefreshCw size={12} className={jobsLoading || appsLoading ? "animate-spin" : ""} />
                <span>Sync Data</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 px-3 py-1.5 rounded-xl transition"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Dossier Banner Card */}
          <div className="bg-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Candidate Identity */}
            <div className="flex items-start sm:items-center gap-4 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#c4f042] text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "CD"}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {user.name || "Engineering Candidate"}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {user.headline || "Software Engineer • Seeking opportunities"}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
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
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition"
                    >
                      <Github size={12} /> GitHub Profile <ExternalLink size={10} />
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition"
                    >
                      <Globe size={12} /> Portfolio <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completeness & Action */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 shrink-0 relative z-10">
              <div className="text-left md:text-right">
                <div className="text-[11px] text-slate-400 font-semibold mb-1">
                  Dossier Completeness: <strong className="text-emerald-400">{profileCompletion.score}%</strong>
                </div>
                <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${profileCompletion.score}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 px-3.5 py-1.5 rounded-xl transition shadow-sm"
              >
                Edit Technical Dossier
              </button>
            </div>
          </div>

          {/* KPI Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Applications Sent
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-950">{stats.total}</span>
                <span className="text-[11px] text-slate-400">tracked</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Under Review
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-amber-600">{stats.inReview}</span>
                <span className="text-[11px] text-slate-400">active</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
                Interviewing / Offers
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-purple-600">
                  {stats.interviewing + stats.accepted}
                </span>
                <span className="text-[11px] text-slate-400">advanced</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Available Roles
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-emerald-600">{jobs.length}</span>
                <span className="text-[11px] text-slate-400">matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-200/90 mb-6 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={`inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === "jobs"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Briefcase size={14} />
            <span>Job Listings & Recommendations</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === "jobs" ? "bg-slate-800 text-slate-200" : "bg-slate-200 text-slate-700"
              }`}
            >
              {jobs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === "applications"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers size={14} />
            <span>My Application Pipeline</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === "applications"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {applications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <User size={14} />
            <span>Technical Dossier & Resume</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
              {profileCompletion.score}%
            </span>
          </button>
        </div>

        {/* ===================================================================
           TAB 1: JOB LISTINGS (Clean, Minimalist Card UI)
           =================================================================== */}
        {activeTab === "jobs" && (
          <section className="space-y-5">
            {/* Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Field */}
              <div className="relative w-full md:w-80 flex items-center">
                <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by role, skills, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Workplace Segmented Filter */}
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
                  Workplace:
                </span>
                {WORKPLACES.map((wp) => (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => setSelectedWorkplace(wp)}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
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

            {/* Category Pills Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Jobs Grid */}
            {jobsLoading ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw size={22} className="animate-spin mx-auto mb-2.5 text-emerald-600" />
                <p className="text-xs font-medium">Scanning live tech roles...</p>
              </div>
            ) : jobsError ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                <p className="font-bold mb-1">Error loading jobs</p>
                <p>{jobsError}</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredJobs.map((job) => {
                  const appliedStatus = appliedJobIdsMap.get(String(job._id));
                  const isApplied = Boolean(appliedStatus);

                  return (
                    <div
                      key={job._id}
                      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Company Badge & Title */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: job.companyColor || "#059669" }}
                            >
                              {job.companyInitials || job.company.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 hover:text-emerald-700 transition cursor-pointer"
                                  onClick={() => setSelectedJob(job)}>
                                {job.title}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                            </div>
                          </div>

                          {isApplied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Check size={11} /> Applied ({appliedStatus})
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                              {job.workplace}
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-2.5">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400" />
                            {job.location}
                          </span>
                          <span>·</span>
                          <span className="font-bold text-emerald-700">{job.salary}</span>
                          <span>·</span>
                          <span className="text-slate-400">{job.type || "Full-time"}</span>
                        </div>

                        {/* Brief summary */}
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {job.description}
                        </p>

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {job.tags.length > 4 && (
                              <span className="text-[10px] font-semibold text-slate-400 px-1 py-0.5">
                                +{job.tags.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>

                        {isApplied ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab("applications")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                          >
                            <span>Track Application</span>
                            <ArrowRight size={12} />
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
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition shadow-sm"
                          >
                            <span>Fast Apply</span>
                            <ArrowUpRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl">
                <Briefcase size={32} className="mx-auto mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">No roles found</h3>
                <p className="text-xs text-slate-500 mb-3">Try adjusting your filters or search keywords.</p>
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
           TAB 2: MY APPLICATION PIPELINE (Visual Multi-Stage Tracker)
           =================================================================== */}
        {activeTab === "applications" && (
          <section className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Application Pipeline</h2>
                <p className="text-xs text-slate-500">Live progress tracker direct from hiring teams.</p>
              </div>
              <button
                type="button"
                onClick={fetchPortalApplications}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                <RefreshCw size={11} className={appsLoading ? "animate-spin" : ""} />
                <span>Sync Status</span>
              </button>
            </div>

            {appsLoading ? (
              <div className="py-20 text-center text-slate-400">
                <RefreshCw size={22} className="animate-spin mx-auto mb-2.5 text-emerald-600" />
                <p className="text-xs font-medium">Fetching application pipeline...</p>
              </div>
            ) : appsError ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
                <p className="font-bold mb-1">Failed to load pipeline</p>
                <p>{appsError}</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => {
                  const job = app.job || {};
                  const statusConfig = statusBadges[app.status] || statusBadges.Applied;

                  return (
                    <div
                      key={app._id}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow transition space-y-4"
                    >
                      {/* Top row: Company, Role, Status Pill */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: job.companyColor || "#059669" }}
                          >
                            {job.companyInitials || (job.company ? job.company.slice(0, 3).toUpperCase() : "JOB")}
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-950 text-sm leading-snug">
                              {job.title || "Engineering Position"}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
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
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-start sm:self-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusConfig.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.label}
                          </span>
                          {job._id && (
                            <button
                              type="button"
                              onClick={() => setSelectedJob(job)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
                              title="View job description"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Visual Multi-Stage Progress Stepper */}
                      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {PIPELINE_STEPS.map((stepName, idx) => {
                            const isCompleted = statusConfig.step > idx + 1;
                            const isCurrent = statusConfig.step === idx + 1;
                            return (
                              <div key={stepName} className="space-y-1">
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition ${
                                      isCurrent
                                        ? "bg-slate-950 text-white ring-2 ring-emerald-400"
                                        : isCompleted
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {isCompleted ? <Check size={12} /> : idx + 1}
                                  </div>
                                </div>
                                <span
                                  className={`block text-[10px] font-semibold tracking-tight ${
                                    isCurrent
                                      ? "text-slate-950 font-bold"
                                      : isCompleted
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Info: Timestamp & Telemetry Link */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Clock size={11} /> Applied {timeAgo(app.createdAt)}
                        </span>
                        {app.githubUrl && (
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                          >
                            <Github size={11} /> Submitted GitHub <ExternalLink size={9} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl">
                <Layers size={32} className="mx-auto mb-2 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">No applications yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Browse open tech roles and submit fast applications using your verified candidate dossier.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className="text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 px-4 py-2 rounded-xl transition"
                >
                  Explore Tech Jobs →
                </button>
              </div>
            )}
          </section>
        )}

        {/* ===================================================================
           TAB 3: TECHNICAL DOSSIER & PROFILE EDITOR
           =================================================================== */}
        {activeTab === "profile" && (
          <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
                  Candidate Technical Dossier
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your engineering stack, telemetry, and portfolio visible to hiring leaders.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {profileCompletion.score}% Complete
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
              {profileCompletion.items.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  {item.done ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span className={item.done ? "text-slate-700 font-medium" : "text-slate-400"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={profileLocation}
                    onChange={(e) => setProfileLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Engineering Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Distributed Systems Engineer • Go, Rust, Kafka"
                  value={profileHeadline}
                  onChange={(e) => setProfileHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    GitHub Profile Link *
                  </label>
                  <div className="relative flex items-center">
                    <Github size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={profileGithub}
                      onChange={(e) => setProfileGithub(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Portfolio / Website URL
                  </label>
                  <div className="relative flex items-center">
                    <Globe size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://portfolio.dev"
                      value={profilePortfolio}
                      onChange={(e) => setProfilePortfolio(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Resume / Document Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or ReadCV"
                    value={profileResume}
                    onChange={(e) => setProfileResume(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Years of Engineering Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profileExp}
                    onChange={(e) => setProfileExp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Interactive Core Skills Chip Manager */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Core Skills & Technologies
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-lg shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {skillsList.length === 0 && (
                      <span className="text-xs text-slate-400">No skills added yet. Add your core languages and stacks below.</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a skill (e.g. Go, React, Kubernetes) and press Enter"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddSkill(e);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-emerald-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Engineering Bio & Architectural Interests
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a brief overview of systems you've built, problems you like tackling, or open source repositories..."
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-950 hover:bg-slate-900 disabled:opacity-60 rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>{profileSaving ? "Saving..." : "Save Dossier"}</span>
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Public Job Detail & Application Modals */}
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
