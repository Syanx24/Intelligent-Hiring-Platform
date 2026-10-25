import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearStoredAuth, getStoredUser } from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";

const roleRoutes = {
  candidate: "/candidate",
  company: "/recruiter",
};

export default function ProtectView({ role, children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Loading workspace…
      </main>
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
