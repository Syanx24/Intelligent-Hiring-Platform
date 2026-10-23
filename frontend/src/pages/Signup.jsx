import { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authenticate } from "../service/apiCall.js";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await authenticate({ mode: "signup", name, email, password });
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

        <span className="section-kicker mt-10 block">START YOUR NEXT CHAPTER</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-[#777a73]">
          Save opportunities and keep your job search moving.
        </p>

        <form className="application-form mt-7" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jamie Taylor"
              minLength={2}
              maxLength={100}
              required
            />
          </label>
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark submit-application" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : "Create account"}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#777a73]">
          Already have an account?{" "}
          <Link className="font-semibold text-[#526c31] hover:underline" to="/login">
            Sign in
          </Link>
        </p>
        <Link className="mt-5 block text-center text-xs text-[#92958c] hover:text-[#526c31]" to="/">
          Back to job listings
        </Link>
      </section>
    </main>
  );
}
