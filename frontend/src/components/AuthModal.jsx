import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Github,
  Globe,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { loginUser, registerUser } from "../service/authAPI.js";

export default function AuthModal({
  isOpen,
  initialRole = "candidate",
  initialMode = "login",
  onClose,
  onAuthSuccess,
}) {
  const [role, setRole] = useState(initialRole); // "candidate" | "company"
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  const clearErrors = () => {
    setError("");
    setValidationErrors([]);
  };

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [headline, setHeadline] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode);
      clearErrors();
    }
  }, [initialMode, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser({ email, password, role });
        onAuthSuccess(res.user, `Welcome back, ${res.user.name}!`);
        onClose();
      } else {
        const payload = {
          name,
          email,
          password,
          role,
          ...(role === "candidate" ? { headline, githubUrl } : { companyName, companyWebsite }),
        };
        const res = await registerUser(payload);
        onAuthSuccess(
          res.user,
          `Account created successfully! Welcome to Northstar, ${res.user.name}.`,
        );
        onClose();
      }
    } catch (err) {
      setError(err.errors?.length ? "" : err.message || "Authentication failed. Please check your credentials.");
      setValidationErrors(err.errors || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop-blur"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card-dialog auth-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          <X size={20} />
        </button>

        {/* Brand & Kicker */}
        <div className="auth-head-center">
          <div className="brand-icon-box mx-auto mb-3">
            <Compass size={22} strokeWidth={2.4} />
          </div>
          <h2 id="auth-modal-title" className="auth-title">
            {mode === "login" ? "Sign In to Northstar" : "Create Your Account"}
          </h2>
          <p className="auth-subtitle">
            {role === "candidate"
              ? "Access tech opportunities, track applications & showcase verified code."
              : "Post engineering roles, review verified candidates & hire faster."}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${role === "candidate" ? "role-active" : ""}`}
            onClick={() => {
              setRole("candidate");
              clearErrors();
            }}
          >
            <User size={16} />
            <span>Tech Candidate</span>
          </button>
          <button
            type="button"
            className={`auth-role-tab ${role === "company" ? "role-active" : ""}`}
            onClick={() => {
              setRole("company");
              clearErrors();
            }}
          >
            <Building2 size={16} />
            <span>Recruiter</span>
          </button>
        </div>

        {/* Mode Toggle (Login vs Register) */}
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`mode-btn ${mode === "login" ? "mode-active" : ""}`}
            onClick={() => {
              setMode("login");
              clearErrors();
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "register" ? "mode-active" : ""}`}
            onClick={() => {
              setMode("register");
              clearErrors();
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {(error || validationErrors.length > 0) && (
            <div className="form-alert-error" role="alert">
              {error && <p>{error}</p>}
              {validationErrors.length > 0 && (
                <ul className="list-disc space-y-1 pl-5">
                  {validationErrors.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          )}

          {mode === "register" && (
            <div className="form-group">
              <label className="field-label" htmlFor="auth-name">
                {role === "candidate" ? "Full Name" : "Your Name / Recruiter Name"} *
              </label>
              <div className="input-with-icon">
                <User size={17} className="input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder={role === "candidate" ? "e.g. Elena Vance" : "e.g. Sarah Jenkins"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input-text with-icon"
                />
              </div>
            </div>
          )}

          {mode === "register" && role === "company" && (
            <>
              <div className="form-group">
                <label className="field-label" htmlFor="auth-company-name">
                  Company Name *
                </label>
                <div className="input-with-icon">
                  <Building2 size={17} className="input-icon" />
                  <input
                    id="auth-company-name"
                    type="text"
                    placeholder="e.g. Stripe, Linear, Vercel"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="form-input-text with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="auth-company-web">
                  Company Website URL
                </label>
                <div className="input-with-icon">
                  <Globe size={17} className="input-icon" />
                  <input
                    id="auth-company-web"
                    type="url"
                    placeholder="https://company.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="form-input-text with-icon"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "register" && role === "candidate" && (
            <>
              <div className="form-group">
                <label className="field-label" htmlFor="auth-headline">
                  Engineering Title / Headline
                </label>
                <div className="input-with-icon">
                  <Briefcase size={17} className="input-icon" />
                  <input
                    id="auth-headline"
                    type="text"
                    placeholder="e.g. Senior Distributed Systems Engineer (Go/Rust)"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="form-input-text with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="auth-github">
                  GitHub Profile Link <span className="text-emerald-600 font-semibold">(Recommended)</span>
                </label>
                <div className="input-with-icon">
                  <Github size={17} className="input-icon" />
                  <input
                    id="auth-github"
                    type="url"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="form-input-text with-icon"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="field-label" htmlFor="auth-email">
              {role === "company" ? "Work Email Address" : "Email Address"} *
            </label>
            <div className="input-with-icon">
              <Mail size={17} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder={role === "company" ? "sarah@company.com" : "elena@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input-text with-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label" htmlFor="auth-password">
              Password {mode === "register" && "(6+ chars, uppercase, lowercase, number, special character)"} *
            </label>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="form-input-text with-icon"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit-apply mt-3"
            disabled={loading}
          >
            <span>
              {loading
                ? mode === "login"
                  ? "Authenticating..."
                  : "Creating Account..."
                : mode === "login"
                ? `Sign In as ${role === "candidate" ? "Candidate" : "Recruiter"}`
                : `Register as ${role === "candidate" ? "Candidate" : "Recruiter"}`}
            </span>
            <ArrowRight size={17} />
          </button>

          <div className="auth-footer-toggle">
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  className="link-switch"
                  onClick={() => {
                    setMode("register");
                    clearErrors();
                  }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="link-switch"
                  onClick={() => {
                    setMode("login");
                    clearErrors();
                  }}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
