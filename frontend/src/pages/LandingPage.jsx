import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal.jsx";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import Improvement from "../features/improvements/Improvement.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ isOpen: false, role: "candidate" });

  const handleAuthSuccess = (user) => {
    navigate(user.role === "candidate" ? "/candidate" : "/recruiter", { replace: true });
  };

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f8faf9] text-[#0f172a] antialiased">
      <Header onOpenAuth={(role) => setAuth({ isOpen: true, role })} />
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
        onClose={() => setAuth((current) => ({ ...current, isOpen: false }))}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
