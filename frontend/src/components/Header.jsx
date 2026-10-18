import { useState } from "react";
import { ArrowUpRight, Compass, Menu, X } from "lucide-react";

export default function Header({ onExplore, onNotice }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Northstar home">
        <span className="brand-mark">
          <Compass size={21} strokeWidth={2.3} />
        </span>
        <span>northstar<span className="brand-period">.</span></span>
      </a>
      <button
        className="mobile-menu-button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className={menuOpen ? "nav-links nav-open" : "nav-links"}>
        <a href="#open-roles" onClick={closeMenu}>Find a job</a>
        <a href="#companies" onClick={closeMenu}>Companies</a>
        <a href="#how-it-works" onClick={closeMenu}>Career advice</a>
      </nav>
      <div className="nav-actions">
        <button className="text-button" onClick={onNotice}>For employers</button>
        <button className="button button-dark nav-cta" onClick={onExplore}>
          Explore jobs <ArrowUpRight size={15} />
        </button>
      </div>
    </header>
  );
}
