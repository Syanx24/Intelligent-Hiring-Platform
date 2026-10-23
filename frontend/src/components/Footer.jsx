import { Compass } from "lucide-react";
function Footer() {
  return (
    <footer className="footer">
      <a className="brand footer-brand" href="/">
        <span className="brand-mark">
          <Compass size={18} strokeWidth={2.3} />
        </span>
        <span>
          HireMe<span className="brand-period">.</span>
        </span>
      </a>
      <p>
        Good work finds good people. © {new Date().getFullYear()} HireMe - Nextech99.
      </p>
      <div>
        <a href="/#open-roles">Find a job</a>
        <a href="/#companies">For companies</a>
        <a href="#home">Instagram ↗</a>
        <a href="/about-us">About Us</a>
      </div>
    </footer>
  );
}

export default Footer;
