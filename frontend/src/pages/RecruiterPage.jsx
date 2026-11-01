import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Briefcase, Building2, LogOut, MapPin, Plus, Users } from "lucide-react";
import AuthModal from "../components/AuthModal.jsx";
import Footer from "../components/Footer.jsx";
import {
  CompanyProfileModal,
  JobApplicantsModal,
  PostJobModal,
} from "../components/recruiter/CompanyModals.jsx";
import {
  clearStoredAuth,
  getStoredUser,
} from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";
import {
  deleteCompanyJob,
  getMyCompanyJobs,
} from "../service/recruiter/recruiterAPI.js";

export default function RecruiterPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [sessionReady, setSessionReady] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");
  const [postJob, setPostJob] = useState({ isOpen: false, job: null });
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    setError("");
    try {
      const results = await getMyCompanyJobs();
      setJobs(Array.isArray(results) ? results : []);
    } catch (loadError) {
      setError(loadError.message || "Could not load your job listings.");
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setSessionReady(true));
  }, []);

  useEffect(() => {
    if (user?.role === "company") loadJobs();
  }, [loadJobs, user]);

  if (!sessionReady) {
    return <div className="min-h-screen bg-slate-50" aria-label="Loading account" />;
  }
  if (user && user.role !== "company") return <Navigate to="/candidate" replace />;

  const signOut = () => {
    clearStoredAuth();
    navigate("/", { replace: true });
  };

  const removeJob = async (job) => {
    if (!window.confirm(`Delete “${job.title}”?`)) return;
    try {
      await deleteCompanyJob(job._id);
      setJobs((current) => current.filter((item) => item._id !== job._id));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete this listing.");
    }
  };

  const applicantCount = jobs.reduce(
    (total, job) => total + (job.applicantCount || 0),
    0,
  );

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <a href="/" className="font-bold tracking-tight">Hire-Me<span className="text-emerald-600">.</span></a>
            <button type="button" className="text-sm font-medium text-slate-600 hover:text-slate-900" onClick={() => navigate("/")}>
              Back to home
            </button>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-12">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-emerald-700">RECRUITER WORKSPACE</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Build your team here.</h1>
            <p className="mt-3 text-slate-600">Sign in or create a recruiter account to post roles and manage applicants.</p>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen
          initialRole="company"
          onClose={() => navigate("/")}
          onAuthSuccess={setUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#18181b]">
      <header className="sticky top-0 z-40 border-b border-[#e4e4e7]/80 bg-[#faf9f6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="/" className="flex items-center gap-2.5 font-bold tracking-tight transition-transform active:scale-95" aria-label="HireMe home">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18181b] font-mono text-sm font-bold text-[#c3c0ff] shadow-sm">
              λ
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[17px] font-semibold tracking-tight text-[#18181b]">HireMe</span>
              <span className="rounded border border-[#e4e4e7] bg-[#f4f3f0] px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-[#52525b]">signal</span>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#18181b] shadow-xs hover:bg-[#f4f3f0] transition"
              onClick={() => setProfileOpen(true)}
              title="Edit Company Profile & Logo"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.companyName || user.name}
                  className="h-6 w-6 rounded-lg object-cover border border-[#e4e4e7]"
                />
              ) : (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black text-white"
                  style={{ backgroundColor: user.companyColor || "#4f46e5" }}
                >
                  {(user.companyInitials || (user.companyName || user.name || "CO").slice(0, 2)).toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline font-mono text-[12px]">{user.companyName || user.name}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#52525b] hover:bg-[#f4f3f0] hover:text-[#18181b] transition"
              onClick={signOut}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              <div
                onClick={() => setProfileOpen(true)}
                className="relative group shrink-0 cursor-pointer"
                title="Edit Company Logo & Profile"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.companyName || user.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-[#e4e4e7] shadow-sm"
                />
              </div>
            ) : (
              <div
                onClick={() => setProfileOpen(true)}
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-sm shrink-0 cursor-pointer hover:opacity-90 transition"
                style={{ backgroundColor: user.companyColor || "#4f46e5" }}
                title="Upload Company Logo"
              >
                {(user.companyInitials || (user.companyName || user.name || "CO").slice(0, 2)).toUpperCase()}
              </div>
            )}
            <div>
              <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#4f46e5]">RECRUITER WORKSPACE</p>
              <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#18181b]">Hiring Intelligence Dashboard</h1>
              <p className="mt-1 text-sm text-[#52525b]">
                Manage roles and evaluate verified candidate AST signals for <strong className="text-[#18181b]">{user.companyName || "your company"}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18181b] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#27272a] active:scale-95 transition"
            onClick={() => setPostJob({ isOpen: true, job: null })}
          >
            <Plus size={16} /> Post a role
          </button>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Hiring statistics">
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f3f0] text-[#18181b]">
              <Briefcase size={18} />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">Total Active Roles</p>
            <p className="mt-1 font-sans text-3xl font-bold text-[#18181b]">{jobs.length}</p>
          </div>
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0e7ff] text-[#4f46e5]">
              <Users size={18} />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">Total Applicants</p>
            <p className="mt-1 font-sans text-3xl font-bold text-[#18181b]">{applicantCount}</p>
          </div>
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">Parsed Repositories</p>
            <p className="mt-1 font-sans text-3xl font-bold text-[#18181b]">1,428</p>
          </div>
          <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-xs">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4f3f0] text-[#4f46e5]">
              <span className="material-symbols-outlined text-[18px]">auto_graph</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#71717a]">Average Signal</p>
            <p className="mt-1 font-sans text-3xl font-bold text-[#18181b]">88.4</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">Your job listings</h2>
              <p className="mt-1 text-sm text-slate-500">Edit roles or review their applicants.</p>
            </div>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              onClick={loadJobs}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {error}
            </div>
          )}
          {loadingJobs ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">Loading your listings…</p>
          ) : jobs.length ? (
            <div className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <article key={job._id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span>{job.category}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {job.location} · {job.workplace}</span>
                      <span>{job.applicantCount || 0} applicants</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => setApplicantsJob(job)}>
                      Applicants
                    </button>
                    <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50" onClick={() => setPostJob({ isOpen: true, job })}>
                      Edit
                    </button>
                    <button type="button" className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50" onClick={() => removeJob(job)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center">
              <Briefcase size={28} className="mx-auto text-slate-400" />
              <h3 className="mt-3 font-semibold">No roles posted yet</h3>
              <p className="mt-1 text-sm text-slate-500">Post your first role to start receiving applications.</p>
              <button type="button" className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700" onClick={() => setPostJob({ isOpen: true, job: null })}>
                Post a role
              </button>
            </div>
          )}
        </section>
      </main>

      <PostJobModal
        isOpen={postJob.isOpen}
        jobToEdit={postJob.job}
        onClose={() => setPostJob({ isOpen: false, job: null })}
        onJobSaved={() => {
          setPostJob({ isOpen: false, job: null });
          loadJobs();
        }}
      />
      <JobApplicantsModal
        isOpen={Boolean(applicantsJob)}
        job={applicantsJob}
        onClose={() => setApplicantsJob(null)}
      />
      <CompanyProfileModal
        isOpen={profileOpen}
        user={user}
        onClose={() => setProfileOpen(false)}
        onProfileUpdated={setUser}
      />
    </div>
  );
}
