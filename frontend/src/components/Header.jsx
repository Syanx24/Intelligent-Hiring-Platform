import { Compass, User } from "lucide-react";

export default function Header({ onOpenAuth }) {
  return (
    <header className="topbar-header">
      <div className="topbar-inner">
        <a className="brand-logo" href="/" aria-label="Hire-Me home">
          <span className="brand-icon-box">
            <Compass size={22} strokeWidth={2.4} />
          </span>
          <span className="brand-name">
            Hire-Me<span className="brand-accent-dot">.</span>
          </span>
          <span className="brand-sub-badge">Nextech</span>
        </a>

        <button
          type="button"
          className="employer-btn"
          onClick={() => onOpenAuth("candidate")}
        >
          <User size={15} /> Login / Register
        </button>
      </div>
    </header>
  );
}
