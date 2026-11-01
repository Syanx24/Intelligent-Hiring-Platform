export default function Footer() {
  return (
    <footer className="w-full border-t border-[#e4e4e7]/80 bg-[#faf9f6] py-12 text-[#52525b]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand & Operational Status */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18181b] font-mono text-xs font-bold text-[#c3c0ff] shadow-xs">
                λ
              </div>
              <span className="font-sans text-[15px] font-semibold tracking-tight text-[#18181b]">
                HireMe
              </span>
              <span className="rounded border border-[#e4e4e7] bg-[#f4f3f0] px-1.5 py-0.2 font-mono text-[10px] font-medium text-[#52525b]">
                signal
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#71717a]">
              Deterministic engineering telemetry. Evaluate deep AST craftsmanship, PR rigor, and real code architecture directly from candidate GitHub profiles.
            </p>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational · v2.4</span>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#18181b]">
              For Candidates
            </h4>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>
                <a href="#catalog" className="transition-colors hover:text-[#18181b]">
                  Explore Open Roles
                </a>
              </li>
              <li>
                <a href="#scanner" className="transition-colors hover:text-[#18181b]">
                  Live Profile Scanner
                </a>
              </li>
              <li>
                <a href="#comparison" className="transition-colors hover:text-[#18181b]">
                  Why Zero LeetCode
                </a>
              </li>
              <li>
                <a href="#catalog" className="transition-colors hover:text-[#18181b]">
                  Remote Opportunities
                </a>
              </li>
            </ul>
          </div>

          {/* For Engineering Leaders */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#18181b]">
              For Teams & Leaders
            </h4>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li>
                <a href="#scanner" className="transition-colors hover:text-[#18181b]">
                  Repo Telemetry Scanner
                </a>
              </li>
              <li>
                <a href="#comparison" className="transition-colors hover:text-[#18181b]">
                  Why Zero LeetCode
                </a>
              </li>
              <li>
                <a href="#catalog" className="transition-colors hover:text-[#18181b]">
                  Verified Developer Roles
                </a>
              </li>
              <li>
                <a href="#roadmap" className="transition-colors hover:text-[#18181b]">
                  Community Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Trust & Compliance */}
          <div>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#18181b]">
              Trust & Compliance
            </h4>
            <ul className="mt-3 space-y-2 text-[13px]">
              <li className="flex items-center gap-1.5 text-[#52525b]">
                <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">
                  verified_user
                </span>
                <span>SOC-2 Type II Certified</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#52525b]">
                <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">
                  visibility
                </span>
                <span>Read-Only GitHub Repos</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#52525b]">
                <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">
                  security
                </span>
                <span>GDPR & CCPA Compliant</span>
              </li>
              <li className="flex items-center gap-1.5 text-[#52525b]">
                <span className="material-symbols-outlined text-[15px] text-[#4f46e5]">
                  lock
                </span>
                <span>Zero Code Retention</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#e4e4e7]/60 pt-6 sm:flex-row text-[12px] text-[#71717a]">
          <p>© {new Date().getFullYear()} HireMe Technologies, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#terms" className="hover:text-[#18181b] transition-colors">
              Terms of Service
            </a>
            <span>·</span>
            <a href="#privacy" className="hover:text-[#18181b] transition-colors">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#security" className="hover:text-[#18181b] transition-colors">
              Security Overview
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
