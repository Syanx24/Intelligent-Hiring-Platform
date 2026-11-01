import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Code2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { loginUser, registerUser } from "../service/authAPI.js";

function getErrorMessage(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item.msg === "string") return item.msg;
  if (typeof item.message === "string") return item.message;
  if (typeof item.error === "string") return item.error;
  return String(item);
}

export default function AuthModal({
  isOpen,
  initialRole = "candidate",
  initialMode = "login",
  initialError = "",
  onClose,
  onAuthSuccess,
}) {
  const [role, setRole] = useState(initialRole); // "candidate" | "company"
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [headline, setHeadline] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  const clearErrors = () => {
    setError("");
    setValidationErrors([]);
  };

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode);
      if (initialError) {
        setError(getErrorMessage(initialError));
        setValidationErrors([]);
      } else {
        clearErrors();
      }
    }
  }, [initialError, initialMode, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleGithubLogin = () => {
    clearErrors();
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
    window.location.href = `${backendUrl}/api/auth/github?role=${role}`;
  };

  const handleFillDemo = (type) => {
    clearErrors();
    if (type === "candidate") {
      setRole("candidate");
      setMode("login");
      setEmail("candidate@example.com");
      setPassword("password123");
    } else {
      setRole("company");
      setMode("login");
      setEmail("recruiter@example.com");
      setPassword("password123");
    }
  };

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
          `Account created successfully! Welcome to HireMe, ${res.user.name}.`,
        );
        onClose();
      }
    } catch (err) {
      const errList = Array.isArray(err.errors) ? err.errors : [];
      if (errList.length > 0) {
        setValidationErrors(errList.map(getErrorMessage).filter(Boolean));
        setError(
          err.message && !err.message.toLowerCase().includes("please correct")
            ? err.message
            : "",
        );
      } else {
        setError(err.message || "Authentication failed. Please check your credentials.");
        setValidationErrors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-xs transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[370px] rounded-2xl border border-[#e4e4e7] bg-white p-5 sm:p-6 shadow-xl transition-all">
        {/* Header: Brand Mark + Title + Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e4e4e7]/70">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18181b] font-mono text-xs font-bold text-[#c3c0ff]">
              λ
            </div>
            <h2 id="auth-modal-title" className="font-sans text-[16px] font-bold text-[#18181b]">
              {mode === "login" ? "Sign in to HireMe" : "Create Account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#71717a] hover:bg-[#f4f3f0] hover:text-[#18181b] transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        <div className="mt-4 flex rounded-xl bg-[#f4f3f0] p-1 border border-[#e4e4e7]/60" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={role === "company"}
            onClick={() => {
              setRole("company");
              clearErrors();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-all ${
              role === "company"
                ? "bg-white text-[#18181b] shadow-xs font-semibold"
                : "text-[#71717a] hover:text-[#18181b]"
            }`}
          >
            <Briefcase size={13} className={role === "company" ? "text-[#4f46e5]" : ""} />
            <span>Recruiter / Org</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={role === "candidate"}
            onClick={() => {
              setRole("candidate");
              clearErrors();
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-medium transition-all ${
              role === "candidate"
                ? "bg-white text-[#18181b] shadow-xs font-semibold"
                : "text-[#71717a] hover:text-[#18181b]"
            }`}
          >
            <Code2 size={13} className={role === "candidate" ? "text-[#4f46e5]" : ""} />
            <span>Candidate</span>
          </button>
        </div>

        {/* Primary GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGithubLogin}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#18181b] py-2.5 px-3 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-[#27272a] active:scale-[0.98]"
        >
          <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              fillRule="evenodd"
            />
          </svg>
          <span>Continue with GitHub</span>
        </button>

        {/* Minimal Divider */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-full border-t border-[#e4e4e7]" />
          <span className="absolute bg-white px-2.5 font-mono text-[10px] uppercase tracking-wider text-[#71717a]">
            or with email
          </span>
        </div>

        {/* Error Feedback */}
        {(error || validationErrors.length > 0) && (
          <div className="mb-2.5 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[12px] text-red-700 shadow-2xs">
            {error && (
              <p className={`font-semibold ${validationErrors.length > 0 ? "mb-1" : ""}`}>
                {error}
              </p>
            )}
            {validationErrors.length > 0 && (
              <ul className="list-inside list-disc space-y-1">
                {validationErrors.map((msg, idx) => (
                  <li key={idx} className="leading-snug">
                    {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-medium text-[#18181b] mb-1" htmlFor="auth-name">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User size={14} className="absolute left-3 text-[#71717a]" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#e4e4e7] bg-[#f4f3f0] py-2 pl-8 pr-3 text-[13px] text-[#18181b] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#18181b] mb-1" htmlFor="auth-email">
              {role === "company" ? "Work Email" : "Email Address"}
            </label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-[#71717a]" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder={role === "company" ? "recruiter@company.com" : "developer@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#e4e4e7] bg-[#f4f3f0] py-2 pl-8 pr-3 text-[13px] text-[#18181b] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#18181b] mb-1" htmlFor="auth-password">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute left-3 text-[#71717a]" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#e4e4e7] bg-[#f4f3f0] py-2 pl-8 pr-9 text-[13px] text-[#18181b] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2.5 flex items-center justify-center text-[#71717a] hover:text-[#18181b] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {mode === "register" && role === "candidate" && (
            <div>
              <label className="block text-[11px] font-medium text-[#18181b] mb-1" htmlFor="auth-headline">
                Headline / Title
              </label>
              <input
                id="auth-headline"
                type="text"
                placeholder="Senior Distributed Systems Engineer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded-xl border border-[#e4e4e7] bg-[#f4f3f0] px-3 py-2 text-[13px] text-[#18181b] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:bg-white"
              />
            </div>
          )}

          {mode === "register" && role === "company" && (
            <div>
              <label className="block text-[11px] font-medium text-[#18181b] mb-1" htmlFor="auth-company">
                Organization / Company Name
              </label>
              <input
                id="auth-company"
                type="text"
                required
                placeholder="Monad Systems"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-[#e4e4e7] bg-[#f4f3f0] px-3 py-2 text-[13px] text-[#18181b] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-[#4f46e5] focus:bg-white"
              />
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#4f46e5] py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:bg-[#4338ca] active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : mode === "login" ? "Sign In" : "Create Account"}</span>
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Footer: Mode Switcher + Demo Pills */}
        <div className="mt-3.5 flex items-center justify-between border-t border-[#e4e4e7]/60 pt-3 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              clearErrors();
            }}
            className="text-[#52525b] hover:text-[#18181b]"
          >
            {mode === "login" ? (
              <>
                Need account? <span className="font-semibold text-[#4f46e5]">Register</span>
              </>
            ) : (
              <>
                Have account? <span className="font-semibold text-[#4f46e5]">Sign in</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 font-mono">
            <span className="text-[#a1a1aa] text-[10px]">Demo:</span>
            <button
              type="button"
              onClick={() => handleFillDemo("candidate")}
              className="rounded bg-[#f4f3f0] px-1.5 py-0.5 text-[10px] text-[#52525b] hover:bg-[#e4e4e7] transition"
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("company")}
              className="rounded bg-[#f4f3f0] px-1.5 py-0.5 text-[10px] text-[#52525b] hover:bg-[#e4e4e7] transition"
            >
              Recruiter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
