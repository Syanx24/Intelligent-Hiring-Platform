import { BrowserRouter, Route, Routes } from "react-router-dom";
import CandidatePage from "../pages/CandidatePage.jsx";
import NotFoundPage from "../pages/404Page.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import RecruiterPage from "../pages/RecruiterPage.jsx";
import ProtectView from "./ProtectView.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/candidate"
          element={
            <ProtectView role="candidate">
              {({ user, onUserUpdate, onNavigateHome, onLogout }) => (
                <CandidatePage
                  user={user}
                  onUserUpdate={onUserUpdate}
                  onNavigateHome={onNavigateHome}
                  onLogout={onLogout}
                />
              )}
            </ProtectView>
          }
        />
        <Route
          path="/recruiter"
          element={
            <ProtectView role="company">
              <RecruiterPage />
            </ProtectView>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
