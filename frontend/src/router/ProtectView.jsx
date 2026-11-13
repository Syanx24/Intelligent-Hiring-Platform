import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser, setStoredAuth } from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const roleRoutes = {
  candidate: "/candidate",
  company: "/recruiter",
};

export default function ProtectView({ role, children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("oauth_token");
    if (oauthToken) {
      setStoredAuth(oauthToken, null);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Header page={role === "candidate" ? "candidate-guest" : "recruiter"} />
        <main className="grid flex-1 place-items-center text-sm text-slate-500">
          Loading workspace…
        </main>
        <Footer />
      </div>
    );
  }

  if (user && user.role !== role) {
    return <Navigate to={roleRoutes[user.role] || "/"} replace />;
  }

  if (typeof children === "function") {
    return children({
      user,
      onUserUpdate: setUser,
      onNavigateHome: () => navigate("/"),
      onLogout: () => {
        clearStoredAuth();
        setUser(null);
        navigate("/", { replace: true });
      },
    });
  }

  return children;
}
