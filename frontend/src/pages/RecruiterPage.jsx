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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2 font-bold tracking-tight" aria-label="Hire-Me home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Building2 size={18} />
            </span>
            Hire-Me<span className="text-emerald-600">.</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:block"
              onClick={() => setProfileOpen(true)}
            >
              {user.companyName || user.name}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={signOut}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-700">RECRUITER WORKSPACE</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your hiring dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage roles and review candidates for {user.companyName || "your company"}.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            onClick={() => setPostJob({ isOpen: true, job: null })}
          >
            <Plus size={17} /> Post a role
          </button>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-2" aria-label="Hiring statistics">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Briefcase size={19} />
            </div>
            <p className="text-sm text-slate-500">Open roles</p>
            <p className="mt-1 text-3xl font-bold">{jobs.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users size={19} />
            </div>
            <p className="text-sm text-slate-500">Applicants</p>
            <p className="mt-1 text-3xl font-bold">{applicantCount}</p>
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
