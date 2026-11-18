import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/", label: "Home" },
  { to: "/#catalog", label: "Explore Jobs" },
  { to: "/candidate", label: "Candidate Portal" },
  { to: "/recruiter", label: "Recruiter Workspace" },
  { to: "/about", label: "About Us" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#e4e4e7]/80 bg-[#faf9f6] py-8 text-[#52525b]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <Link to="/" className="flex items-center gap-2 text-[#18181b]" aria-label="HireMe NexTech99 home">
            <img src={import.meta.env.VITE_APP_LOGO_URL || "/logo.svg"} alt="" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-[15px] font-semibold tracking-tight">HireMe</span>
            <span className="rounded border border-[#e4e4e7] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#52525b]">NexTech99</span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px]" aria-label="Footer links">
            {footerLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="transition-colors hover:text-[#18181b]">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#e4e4e7]/60 pt-4 text-[11px] text-[#71717a] sm:flex-row">
          <p>© {new Date().getFullYear()} HireMe NexTech99. All rights reserved.</p>
          <p>Built to connect great people with meaningful work.</p>
        </div>
      </div>
    </footer>
  );
}
