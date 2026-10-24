import { useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Compass,
  FileText,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";

export default function Header({
  user,
  currentPage = "home",
  onNavigateCandidatePortal,
  onNavigateHome,
  onExplore,
  onOpenAuth,
  onOpenProfile,
  onOpenApplications,
  onOpenDashboard,
  onOpenPostJob,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar-header">
      <div className="topbar-inner">
        <a
          className="brand-logo"
          href="#home"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          aria-label="Northstar Home"
        >
          <span className="brand-icon-box">
            <Compass size={22} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            northstar<span className="brand-accent-dot">.</span>
          </span>
          <span className="brand-sub-badge">Platform</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {currentPage === "candidate-portal" ? (
            <>
              <button
                type="button"
                onClick={onNavigateHome}
                className="nav-item bg-transparent border-none cursor-pointer"
              >
                ← Back to Public Site
              </button>
              <button
                type="button"
                onClick={onNavigateCandidatePortal}
                className="nav-item bg-transparent border-none cursor-pointer text-emerald-600 font-bold"
              >
                Candidate Dashboard
              </button>
            </>
          ) : (
            <>
              <a href="#ai-evaluation" className="nav-item">AI Vetting Engine</a>
              <a href="#open-roles" className="nav-item">Explore Roles</a>
              <a href="#categories" className="nav-item">Tech Stacks</a>
              <button
                type="button"
                onClick={onNavigateCandidatePortal}
                className="nav-item bg-transparent border-none cursor-pointer text-emerald-600 font-bold"
              >
                Candidate Portal
              </button>
            </>
          )}
        </nav>

        {/* Actions based on Authentication State */}
        <div className="topbar-actions">
          {!user ? (
            <>
              <button
                type="button"
                className={`btn-auth-nav ${
                  currentPage === "candidate-portal" ? "border-emerald-500 text-emerald-700 bg-emerald-50" : ""
                }`}
                onClick={onNavigateCandidatePortal}
              >
                <User size={15} />
                <span>Candidate Portal</span>
              </button>

              <button
                type="button"
                className="employer-btn"
                onClick={() => onOpenAuth("company", "login")}
              >
                <Building2 size={15} />
                <span>For Employers</span>
              </button>

              <button
                type="button"
                className="btn-primary-explore"
                onClick={() => {
                  if (currentPage === "candidate-portal" && onNavigateHome) {
                    onNavigateHome();
                    setTimeout(onExplore, 100);
                  } else {
                    onExplore();
                  }
                }}
              >
                <span>Browse Jobs</span>
                <ArrowUpRight size={16} />
              </button>
            </>
          ) : user.role === "candidate" ? (
            <>
              <button
                type="button"
                className={`btn-auth-nav ${
                  currentPage === "candidate-portal"
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50 font-bold"
                    : ""
                }`}
                onClick={onNavigateCandidatePortal}
              >
                <Briefcase size={15} />
                <span>Candidate Dashboard</span>
              </button>

              <button
                type="button"
                className="btn-auth-nav hidden sm:inline-flex"
                onClick={onOpenApplications}
              >
                <FileText size={15} />
                <span>My Applications</span>
              </button>

              <button
                type="button"
                className="user-profile-badge-btn"
                onClick={() => {
                  if (onNavigateCandidatePortal) onNavigateCandidatePortal();
                  else onOpenProfile();
                }}
                title="View your candidate dashboard & profile"
              >
                <div className="user-badge-avatar">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="user-badge-name">{user.name}</span>
                  <span className="user-badge-role">Candidate</span>
                </div>
              </button>

              <button
                type="button"
                className="btn-logout-icon"
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            /* Company Role */
            <>
              <button
                type="button"
                className="btn-primary-explore"
                onClick={onOpenPostJob}
              >
                <Plus size={15} />
                <span>Post a Role</span>
              </button>

              <button
                type="button"
                className="btn-auth-nav"
                onClick={onOpenDashboard}
              >
                <Briefcase size={15} />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                className="user-profile-badge-btn"
                onClick={onOpenProfile}
                title="Edit company profile"
              >
                <div
                  className="user-badge-avatar"
                  style={{ backgroundColor: user.companyColor || "#059669" }}
                >
                  {user.companyInitials || (user.companyName ? user.companyName.slice(0, 2).toUpperCase() : "CO")}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="user-badge-name">{user.companyName || user.name}</span>
                  <span className="user-badge-role">Employer</span>
                </div>
              </button>

              <button
                type="button"
                className="btn-logout-icon"
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mobile-nav-links">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onNavigateHome();
                }}
                className="mobile-nav-item text-left w-full bg-transparent border-none"
              >
                Public Home
              </button>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  onNavigateCandidatePortal();
                }}
                className="mobile-nav-item text-left w-full bg-transparent border-none text-emerald-600 font-bold"
              >
                Candidate Portal & Dashboard
              </button>
              <a href="#open-roles" onClick={closeMenu} className="mobile-nav-item">
                Explore Roles
              </a>
              <a href="#ai-evaluation" onClick={closeMenu} className="mobile-nav-item">
                AI Vetting Engine
              </a>
            </nav>

            <div className="mobile-drawer-footer">
              {!user ? (
                <>
                  <button
                    type="button"
                    className="btn-auth-nav w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onNavigateCandidatePortal();
                    }}
                  >
                    <User size={15} />
                    <span>Candidate Portal / Login</span>
                  </button>
                  <button
                    type="button"
                    className="employer-btn w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onOpenAuth("company", "login");
                    }}
                  >
                    <Building2 size={15} />
                    <span>For Employers</span>
                  </button>
                </>
              ) : user.role === "candidate" ? (
                <>
                  <button
                    type="button"
                    className="btn-primary-explore w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onNavigateCandidatePortal();
                    }}
                  >
                    <Briefcase size={15} />
                    <span>Candidate Dashboard</span>
                  </button>
                  <button
                    type="button"
                    className="btn-auth-nav w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onOpenApplications();
                    }}
                  >
                    <FileText size={15} />
                    <span>My Applications</span>
                  </button>
                  <button
                    type="button"
                    className="modal-btn-cancel w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onLogout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-primary-explore w-full"
                    onClick={() => {
                      closeMenu();
                      onOpenPostJob();
                    }}
                  >
                    <Plus size={15} />
                    <span>Post a Role</span>
                  </button>
                  <button
                    type="button"
                    className="btn-auth-nav w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onOpenDashboard();
                    }}
                  >
                    <Briefcase size={15} />
                    <span>Company Dashboard</span>
                  </button>
                  <button
                    type="button"
                    className="employer-btn w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onOpenProfile();
                    }}
                  >
                    <Building2 size={15} />
                    <span>Company Profile</span>
                  </button>
                  <button
                    type="button"
                    className="modal-btn-cancel w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onLogout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
