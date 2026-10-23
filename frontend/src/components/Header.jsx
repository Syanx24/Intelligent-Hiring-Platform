import { useState } from "react";
import { ArrowUpRight, Compass, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({ onExplore, onNotice }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="Hire-Me home">
        <span className="brand-mark">
          <Compass size={21} strokeWidth={2.3} />
        </span>
        <span>Hire-Me<span className="brand-period">.</span></span>
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
        <a href="/#open-roles" onClick={closeMenu}>Find a job</a>
        <a href="/#companies" onClick={closeMenu}>Companies</a>
        <a href="/#how-it-works" onClick={closeMenu}>Career advice</a>
      </nav>
      <div className="nav-actions">
        <Link className="button button-dark nav-cta" to="/login">
          Login <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}
