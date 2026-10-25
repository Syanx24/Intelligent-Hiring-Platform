import { BrowserRouter, Route, Routes } from "react-router-dom";
import AboutUsPage from "../pages/AboutUs.jsx";
import NotFoundPage from "../pages/404Page.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import LandingPage from "../pages/LandingPage.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
