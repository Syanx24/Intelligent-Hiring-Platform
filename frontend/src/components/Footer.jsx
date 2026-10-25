import { Compass } from "lucide-react";
function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top-grid">
          <div className="footer-brand-column">
            <a className="footer-brand" href="#home" aria-label="Northstar Home">
              <span className="brand-icon-box">
                <Compass size={20} strokeWidth={2.4} />
              </span>
              <span className="brand-name">
                Hire-Me<span className="brand-accent-dot">.</span>
              </span>
            </a>
            <p className="footer-tagline">
              Connecting exceptional builders, designers, and innovators with high-impact teams shaping tomorrow.
            </p>
            <div className="footer-status-pill">
              <span className="pulse-dot-green" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="footer-links-column">
            <h4>For Candidates</h4>
            <ul>
              <li><a href="#open-roles">Browse All Jobs</a></li>
              <li><a href="#categories">Search by Discipline</a></li>
              <li><a href="#open-roles">Remote Opportunities</a></li>
              <li><a href="#companies">Company Profiles</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>For Employers</h4>
            <ul>
              <li><a href="#home">Post a Role</a></li>
              <li><a href="#home">Talent Matching API</a></li>
              <li><a href="#home">Hiring Benchmarks</a></li>
              <li><a href="#home">Recruiter Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#home">About Northstar</a></li>
              <li><a href="#home">Privacy & Terms</a></li>
              <li><a href="#home">Security</a></li>
              <li><a href="#home">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} Northstar Technologies, Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#home">Privacy Policy</a>
            <span>·</span>
            <a href="#home">Terms of Service</a>
            <span>·</span>
            <a href="#home">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
