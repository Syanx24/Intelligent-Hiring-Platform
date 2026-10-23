import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import Footer from "../components/Footer.jsx";
import {
  CategorySection,
  ClosingCta,
  FeaturedSection,
  JobsSection,
  TrustRow,
  categories,
} from "../components/JobSections.jsx";
import { ApplicationModal, JobDetailsModal } from "../components/JobModals.jsx";
import Improvement from "../features/improvements/Improvement.jsx";
import { getJobs, submitApplication } from "../service/apiCall.js";

function HomePage() {
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

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const featuredJobs = useMemo(
    () => jobs.filter((job) => job.featured).slice(0, 3),
    [jobs],
  );

  const scrollToJobs = () =>
    document
      .getElementById("open-roles")
      ?.scrollIntoView({ behavior: "smooth" });

  const openApply = (job) => {
    setSelectedJob(null);
    setApplicationJob(job);
    setApplicationState("idle");
    setApplicationError("");
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    setApplicationState("submitting");
    setApplicationError("");
    const form = new FormData(event.currentTarget);

    try {
      await submitApplication({
        jobId: applicationJob._id,
        name: form.get("name"),
        email: form.get("email"),
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

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f7f8f4] text-[#20221e]">
      <Header
        onExplore={scrollToJobs}
        onNotice={() => setNotice("Recruiter tools are coming soon.")}
      />
      <main id="home">
        <Hero
          search={search}
          location={location}
          onSearchChange={setSearch}
          onLocationChange={setLocation}
          onExplore={scrollToJobs}
        />
        <TrustRow />
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
      <Footer />
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={() => openApply(selectedJob)}
      />
      <ApplicationModal
        job={applicationJob}
        status={applicationState}
        error={applicationError}
        onClose={() => setApplicationJob(null)}
        onSubmit={submitApplication}
      />
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
}

export default HomePage;
