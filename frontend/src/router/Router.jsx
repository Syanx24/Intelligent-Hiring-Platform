import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "../App.jsx";
import HomePage from "../pages/HomePage.jsx";
import AboutUsPage from "../pages/AboutUsPage.jsx";
import NotFoundPage from "../pages/404Page.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
