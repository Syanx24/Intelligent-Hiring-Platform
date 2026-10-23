import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authenticate } from "../service/apiCall.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await authenticate({
        mode: "login",
        email,
        password,
      });
      window.localStorage.setItem("hireme.authToken", result.token);
      window.localStorage.setItem("hireme.user", JSON.stringify(result.user));
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="site-shell flex min-h-screen items-center justify-center bg-[#f7f8f4] px-5 py-12 text-[#20221e]">
      <section className="w-full max-w-[440px] rounded-xl border border-[#e9eae4] bg-white p-7 shadow-sm sm:p-10">
        <Link className="brand" to="/" aria-label="Hire-Me home">
          <span className="brand-mark"><Compass size={21} strokeWidth={2.3} /></span>
          <span>Hire-Me<span className="brand-period">.</span></span>
        </Link>

        <span className="section-kicker mt-10 block">WELCOME BACK</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sign in to Hire-Me
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#777a73]">
          Sign in to continue your job search.
        </p>

        <form className="application-form mt-7" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              maxLength={128}
              required
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark submit-application" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : "Sign in"}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#777a73]">
          New to Hire-Me? {" "}
          <Link className="font-semibold text-[#526c31] hover:underline" to="/signup">
            Create an account
          </Link>
        </p>
        <Link className="mt-5 block text-center text-xs text-[#92958c] hover:text-[#526c31]" to="/">
          Back to job listings
        </Link>
      </section>
    </main>
  );
}
