<<<<<<< HEAD
import Router from "./router/Router.jsx";

export default function App() {
  
  return <Router />;
=======
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import EngineeringIntelligence from "./components/EngineeringIntelligence.jsx";
import {
  CategorySection,
  ClosingCta,
  FeaturedSection,
  Footer,
  JobsSection,
  TrustRow,
  categories,
} from "./components/JobSections.jsx";
import { ApplicationModal, JobDetailsModal } from "./components/JobModals.jsx";
import AuthModal from "./components/AuthModal.jsx";
import {
  CandidateProfileModal,
  MyApplicationsModal,
} from "./components/CandidateModals.jsx";
import {
  CompanyDashboardModal,
  CompanyProfileModal,
  JobApplicantsModal,
  PostJobModal,
} from "./components/CompanyModals.jsx";
import CandidatePortalPage from "./pages/CandidatePortalPage.jsx";
import Improvement from "./features/improvements/Improvement.jsx";
import {
  clearStoredAuth,
  getCurrentUser,
  getJobs,
  getStoredUser,
  submitApplication as apiSubmitApplication,
} from "./service/apiCall.js";

function App() {
  // Page Routing State ('home' | 'candidate-portal')
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith("#/candidate")) {
      return "candidate-portal";
    }
    return "home";
  });

  // Global & Jobs State
  const [jobs, setJobs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All roles");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationJob, setApplicationJob] = useState(null);
  const [applicationState, setApplicationState] = useState("idle");
  const [applicationError, setApplicationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [notice, setNotice] = useState("");

  // Authentication State
  const [user, setUser] = useState(() => getStoredUser());
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    role: "candidate",
    mode: "login",
  });

  // Candidate Modals
  const [candidateProfileOpen, setCandidateProfileOpen] = useState(false);
  const [myApplicationsOpen, setMyApplicationsOpen] = useState(false);

  // Company Modals
  const [companyDashboardOpen, setCompanyDashboardOpen] = useState(false);
  const [companyProfileOpen, setCompanyProfileOpen] = useState(false);
  const [postJobModal, setPostJobModal] = useState({
    isOpen: false,
    jobToEdit: null,
  });
  const [jobApplicantsModal, setJobApplicantsModal] = useState({
    isOpen: false,
    job: null,
  });

  // Listen to hash changes for direct URL navigation / bookmarks
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith("#/candidate")) {
        setCurrentPage("candidate-portal");
      } else {
        setCurrentPage("home");
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Check & restore user session on mount
  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      if (currentUser) setUser(currentUser);
    });
  }, []);

  // Fetch Jobs on Filter Change or Retry
  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");
    getJobs(
      { search, category: activeCategory, workplace: location },
      { signal: controller.signal },
    )
      .then(setJobs)
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(fetchError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search, activeCategory, location, retryCount]);

  // Notice auto-dismiss
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const featuredJobs = useMemo(
    () => jobs.filter((job) => job.featured).slice(0, 3),
    [jobs],
  );

  const scrollToJobs = () =>
    document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" });

  const navigateToCandidate = () => {
    setCurrentPage("candidate-portal");
    window.location.hash = "#/candidate";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToHome = () => {
    setCurrentPage("home");
    window.location.hash = "#home";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openApply = (job) => {
    setSelectedJob(null);
    setApplicationJob(job);
    setApplicationState("idle");
    setApplicationError("");
  };

  const handleApplicationSubmit = async (event) => {
    event.preventDefault();
    setApplicationState("submitting");
    setApplicationError("");
    const form = new FormData(event.currentTarget);

    try {
      await apiSubmitApplication({
        jobId: applicationJob._id,
        name: form.get("name"),
        email: form.get("email"),
        githubUrl: form.get("githubUrl"),
        resumeUrl: form.get("resumeUrl"),
        message: form.get("message"),
      });
      setApplicationState("success");
    } catch (submitError) {
      setApplicationState("idle");
      setApplicationError(submitError.message);
    }
  };

  const clearFilters = () => {
    setActiveCategory(categories[0]);
    setLocation("");
    setSearch("");
  };

  const handleLogout = () => {
    clearStoredAuth();
    setUser(null);
    setCandidateProfileOpen(false);
    setMyApplicationsOpen(false);
    setCompanyDashboardOpen(false);
    setCompanyProfileOpen(false);
    setPostJobModal({ isOpen: false, jobToEdit: null });
    setJobApplicantsModal({ isOpen: false, job: null });
    setNotice("You have been signed out successfully.");
  };

  const handleAuthSuccess = (authenticatedUser, message) => {
    setUser(authenticatedUser);
    setNotice(message || "Signed in successfully.");
    // After login, candidate automatically goes to their candidate portal / dashboard
    if (authenticatedUser?.role === "candidate") {
      setCurrentPage("candidate-portal");
      window.location.hash = "#/candidate/dashboard";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJobSaved = (savedJob) => {
    setNotice(
      postJobModal.jobToEdit
        ? `Job "${savedJob.title}" updated successfully.`
        : `Job "${savedJob.title}" published successfully!`,
    );
    setRetryCount((c) => c + 1); // Triggers job list refresh
  };

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f8faf9] text-[#0f172a] antialiased">
      {/* Header with full Candidate & Company Auth integration */}
      <Header
        user={user}
        currentPage={currentPage}
        onNavigateCandidatePortal={navigateToCandidate}
        onNavigateHome={navigateToHome}
        onExplore={scrollToJobs}
        onOpenAuth={(role, mode) =>
          setAuthModal({ isOpen: true, role, mode })
        }
        onOpenProfile={() => {
          if (user?.role === "candidate") navigateToCandidate();
          else if (user?.role === "company") setCompanyProfileOpen(true);
        }}
        onOpenApplications={() => {
          if (user?.role === "candidate") navigateToCandidate();
          else setMyApplicationsOpen(true);
        }}
        onOpenDashboard={() => setCompanyDashboardOpen(true)}
        onOpenPostJob={() =>
          setPostJobModal({ isOpen: true, jobToEdit: null })
        }
        onLogout={handleLogout}
      />

      {currentPage === "candidate-portal" ? (
        /* Dedicated Candidate Site Page: Login & Register when unauthenticated, Dashboard when logged in */
        <CandidatePortalPage
          user={user}
          onUserUpdate={(updatedUser, message) => {
            setUser(updatedUser);
            if (message) setNotice(message);
          }}
          onNavigateHome={navigateToHome}
          onLogout={handleLogout}
        />
      ) : (
        <main id="home">
          {/* Preserved Landing Page Sections */}
          <Hero
            search={search}
            location={location}
            onSearchChange={setSearch}
            onLocationChange={setLocation}
            onExplore={scrollToJobs}
          />
          <TrustRow />
          <EngineeringIntelligence onExplore={scrollToJobs} />
          <CategorySection
            onSelectCategory={(category) => {
              setActiveCategory(category);
              scrollToJobs();
            }}
            onExplore={scrollToJobs}
          />
          <FeaturedSection
            jobs={featuredJobs}
            onSelectJob={setSelectedJob}
            onExplore={scrollToJobs}
          />
          <JobsSection
            jobs={jobs}
            activeCategory={activeCategory}
            loading={loading}
            error={error}
            onCategoryChange={setActiveCategory}
            onClearFilters={clearFilters}
            onRetry={() => setRetryCount((count) => count + 1)}
            onSelectJob={setSelectedJob}
            onShowAll={clearFilters}
          />
          <ClosingCta onExplore={scrollToJobs} />
          <Improvement />
        </main>
      )}

      <Footer />

      {/* Core Public Modals */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={() => openApply(selectedJob)}
      />

      <ApplicationModal
        job={applicationJob}
        user={user}
        status={applicationState}
        error={applicationError}
        onClose={() => setApplicationJob(null)}
        onSubmit={handleApplicationSubmit}
      />

      {/* Authentication Modal (Candidate & Company) */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialRole={authModal.role}
        initialMode={authModal.mode}
        onClose={() =>
          setAuthModal((prev) => ({ ...prev, isOpen: false }))
        }
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Candidate Portal Modals */}
      <CandidateProfileModal
        isOpen={candidateProfileOpen}
        user={user}
        onClose={() => setCandidateProfileOpen(false)}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
          setNotice("Candidate profile updated.");
        }}
      />

      <MyApplicationsModal
        isOpen={myApplicationsOpen}
        onClose={() => setMyApplicationsOpen(false)}
        onExplore={scrollToJobs}
        onSelectJob={setSelectedJob}
      />

      {/* Company Portal Modals */}
      <CompanyDashboardModal
        isOpen={companyDashboardOpen}
        user={user}
        onClose={() => setCompanyDashboardOpen(false)}
        onOpenPostJob={(job) =>
          setPostJobModal({ isOpen: true, jobToEdit: job })
        }
        onOpenEditJob={(job) =>
          setPostJobModal({ isOpen: true, jobToEdit: job })
        }
        onOpenApplicants={(job) =>
          setJobApplicantsModal({ isOpen: true, job })
        }
        onOpenCompanyProfile={() => setCompanyProfileOpen(true)}
      />

      <JobApplicantsModal
        isOpen={jobApplicantsModal.isOpen}
        job={jobApplicantsModal.job}
        onClose={() =>
          setJobApplicantsModal({ isOpen: false, job: null })
        }
      />

      <PostJobModal
        isOpen={postJobModal.isOpen}
        jobToEdit={postJobModal.jobToEdit}
        onClose={() =>
          setPostJobModal({ isOpen: false, jobToEdit: null })
        }
        onJobSaved={handleJobSaved}
      />

      <CompanyProfileModal
        isOpen={companyProfileOpen}
        user={user}
        onClose={() => setCompanyProfileOpen(false)}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
          setNotice("Company profile updated.");
        }}
      />

      {/* Feedback Toast Notification */}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
>>>>>>> f7a271de36859c06fd6e709af4247cc5cc98d015
}
