import { ArrowRight, Briefcase, LogOut, UserRound } from "lucide-react";

const candidateLinks = [
  ["jobs", "Jobs"],
  ["applications", "Applications"],
  ["profile", "Profile"],
];

export default function Header({
  page = "home",
  user,
  activeTab,
  onTabChange,
  onOpenAuth,
  onLogout,
  onProfileClick,
  onRefresh,
  syncing = false,
  counts = {},
}) {
  const isCandidate = page === "candidate";
  const isRecruiter = page === "recruiter";
  const homeHref = user?.role === "company"
    ? "/recruiter"
    : user?.role === "candidate"
      ? "/candidate"
      : "/";

  return (
    <header className="site-header sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="site-header-inner mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href={homeHref} className="site-brand flex shrink-0 items-center gap-2.5" aria-label="HireMe home">
          <span className="site-brand-mark grid h-9 w-9 place-items-center rounded-xl bg-slate-900 font-mono text-sm font-bold text-white">λ</span>
          <span className="flex items-center gap-1.5 text-[17px] font-semibold tracking-tight text-slate-900">
            HireMe <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-slate-600">signal</span>
          </span>
        </a>

        <nav className={`site-header-nav items-center gap-1 ${isCandidate && user ? "flex min-w-0 flex-1 overflow-x-auto md:flex-none" : "hidden md:flex"}`} aria-label="Main navigation">
          {isCandidate && user ? candidateLinks.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-current={activeTab === key ? "page" : undefined}
              onClick={() => onTabChange?.(key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >{label}{Number.isFinite(counts[key]) && <span className="ml-1.5 rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500">{counts[key]}</span>}</button>
          )) : isRecruiter ? (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Recruiter workspace</span>
          ) : (
            <>
              <a href="/#catalog" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">Explore roles</a>
              {page === "home" && <>
                <a href="/#comparison" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">Why HireMe</a>
                <a href="/#roadmap" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">Roadmap</a>
              </>}
              <a href="/about" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">About us</a>
            </>
          )}
        </nav>

        <div className="site-header-actions flex shrink-0 items-center gap-2">
          {isCandidate && user && onRefresh && <button type="button" onClick={onRefresh} className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex">{syncing ? "Syncing…" : "Sync data"}</button>}
          {user ? (
            <>
              <button
                type="button"
                onClick={onProfileClick}
                className="inline-flex max-w-52 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                aria-label={isRecruiter ? "Edit company profile" : "Candidate profile"}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-lg bg-blue-50 text-blue-700">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : isRecruiter ? <Briefcase size={15} /> : <UserRound size={15} />}
                </span>
                <span className="hidden truncate sm:block">{isRecruiter ? "Profile" : (user.name || "Candidate")}</span>
              </button>
              <button type="button" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50" aria-label="Sign out">
                <LogOut size={15} /><span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : onOpenAuth ? (
            <>
              <button type="button" onClick={() => onOpenAuth("company")} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex">For recruiters</button>
              <button type="button" onClick={() => onOpenAuth("candidate")} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Sign in <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <a href={isRecruiter ? "/" : "/#catalog"} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {isRecruiter ? "Back to home" : "Browse jobs"}<ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
