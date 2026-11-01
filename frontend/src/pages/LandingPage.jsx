import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import Improvement from "../features/improvements/Improvement.jsx";
import { setStoredAuth } from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";

export default function LandingPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ isOpen: false, role: "candidate", oauthError: "" });

  const handleAuthSuccess = (user) => {
    navigate(user.role === "candidate" ? "/candidate" : "/recruiter", { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauth_token");
    const oauthError = params.get("oauth_error");

    if (oauthToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setStoredAuth(oauthToken, null);
      getCurrentUser().then((user) => {
        if (user) {
          setStoredAuth(oauthToken, user);
          handleAuthSuccess(user);
        }
      });
    } else if (oauthError) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuth({ isOpen: true, role: "candidate", oauthError });
    }
  }, []);

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f8faf9] text-[#0f172a] antialiased">
      <Header onOpenAuth={(role) => setAuth({ isOpen: true, role, oauthError: "" })} />
      <main id="home">
          this is landing page should be filled with catelog
        <section id="catalog" aria-label="Job catalog">
          <Improvement />
        </section>
      </main>
      <Footer />
      <AuthModal
        isOpen={auth.isOpen}
        initialRole={auth.role}
        initialError={auth.oauthError || ""}
        onClose={() => setAuth((current) => ({ ...current, isOpen: false, oauthError: "" }))}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
