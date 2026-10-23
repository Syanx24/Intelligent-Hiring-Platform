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
        <a className="brand-logo" href="#home" aria-label="Northstar Home">
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
          <a href="#ai-evaluation" className="nav-item">AI Vetting Engine</a>
          <a href="#open-roles" className="nav-item">Explore Roles</a>
          <a href="#categories" className="nav-item">Tech Stacks</a>
          <a href="#companies" className="nav-item">Top Teams</a>
        </nav>

        {/* Actions based on Authentication State */}
        <div className="topbar-actions">
          {!user ? (
            <>
              <button
                type="button"
                className="btn-auth-nav"
                onClick={() => onOpenAuth("candidate", "login")}
              >
                <User size={15} />
                <span>Candidate Sign In</span>
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
                onClick={onExplore}
              >
                <span>Browse Jobs</span>
                <ArrowUpRight size={16} />
              </button>
            </>
          ) : user.role === "candidate" ? (
            <>
              <button
                type="button"
                className="btn-auth-nav"
                onClick={onOpenApplications}
              >
                <FileText size={15} />
                <span>My Applications</span>
              </button>

              <button
                type="button"
                className="user-profile-badge-btn"
                onClick={onOpenProfile}
                title="Edit your candidate profile"
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
              <a href="#ai-evaluation" onClick={closeMenu} className="mobile-nav-item">
                AI Vetting Engine
              </a>
              <a href="#open-roles" onClick={closeMenu} className="mobile-nav-item">
                Explore Roles
              </a>
              <a href="#categories" onClick={closeMenu} className="mobile-nav-item">
                Tech Stacks
              </a>
              <a href="#companies" onClick={closeMenu} className="mobile-nav-item">
                Featured Teams
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
                      onOpenAuth("candidate", "login");
                    }}
                  >
                    <User size={15} />
                    <span>Candidate Sign In</span>
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
                  <button
                    type="button"
                    className="btn-primary-explore w-full"
                    onClick={() => {
                      closeMenu();
                      onExplore();
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
                    className="employer-btn w-full justify-center"
                    onClick={() => {
                      closeMenu();
                      onOpenProfile();
                    }}
                  >
                    <User size={15} />
                    <span>My Profile</span>
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
