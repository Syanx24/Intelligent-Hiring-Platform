import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { clearStoredAuth, getStoredUser } from "../service/apiClient.js";
import { getCurrentUser } from "../service/authAPI.js";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <div className="site-shell min-h-screen w-full overflow-x-hidden bg-[#f7f8f4] text-[#20221e]">
      <Header
        page="info"
        user={user}
        onProfileClick={() => navigate(user?.role === "company" ? "/recruiter" : "/candidate")}
        onLogout={() => {
          clearStoredAuth();
          setUser(null);
          navigate("/", { replace: true });
        }}
      />
      <main className="section-wrap mx-auto flex min-h-[65vh] w-[90%] max-w-[1160px] flex-col items-center justify-center py-16 text-center">
        <span className="section-kicker">404 · PAGE NOT FOUND</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">This page isn’t here.</h1>
        <p className="mt-3 text-sm text-[#777a73]">The link may be old, or the address may have a typo.</p>
        <Link className="button button-dark mt-7" to="/">Back to home</Link>
      </main>
      <Footer />
    </div>
  );
}
