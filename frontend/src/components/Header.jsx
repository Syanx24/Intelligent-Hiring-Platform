import { ArrowRight, Sparkles, Terminal } from "lucide-react";

export default function Header({ onOpenAuth }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e4e4e7]/80 bg-[#faf9f6]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Mark */}
        <a href="/" className="flex items-center gap-2.5 transition-transform active:scale-95" aria-label="HireMe Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18181b] font-mono text-sm font-bold text-[#c3c0ff] shadow-sm">
            <span>λ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[17px] font-semibold tracking-tight text-[#18181b]">
              HireMe
            </span>
            <span className="rounded border border-[#e4e4e7] bg-[#f4f3f0] px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide text-[#52525b]">
              signal
            </span>
          </div>
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main Navigation">
          <a
            href="#catalog"
            className="text-[13px] font-medium text-[#52525b] transition-colors hover:text-[#18181b]"
          >
            Explore Roles
          </a>
          <a
            href="#comparison"
            className="text-[13px] font-medium text-[#52525b] transition-colors hover:text-[#18181b]"
          >
            Why HireMe
          </a>
          <a
            href="#roadmap"
            className="text-[13px] font-medium text-[#52525b] transition-colors hover:text-[#18181b]"
          >
            Roadmap
          </a>
        </nav>

        {/* Right Status Pill & Auth Triggers */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Engine Live Status Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 font-mono text-[11px] text-[#52525b] shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-[#18181b]">v2.4 Live · AST Engine</span>
          </div>

          {/* Employer Quick Action */}
          <button
            type="button"
            onClick={() => onOpenAuth?.("company")}
            className="hidden text-[12px] font-medium text-[#52525b] hover:text-[#18181b] sm:block px-2 py-1 transition-colors"
          >
            For Recruiters
          </button>

          {/* Primary Sign In Button */}
          <button
            type="button"
            onClick={() => onOpenAuth?.("candidate")}
            className="flex items-center gap-1.5 rounded-full bg-[#18181b] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-xs transition-all hover:bg-[#27272a] active:scale-95"
          >
            <span>Sign in</span>
            <ArrowRight size={13} className="text-[#c3c0ff]" />
          </button>
        </div>
      </div>
    </header>
  );
}
