import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MoodCheckinPage from "./pages/MoodCheckinPage";
import PerfectDaySchedulePage from "./pages/PerfectDaySchedulePage";
import WorkRestPage from "./pages/WorkRestPage";
import FitnessPage from "./pages/FitnessPage";
import MoodPage from "./pages/MoodPage";
import EmergencyPage from "./pages/EmergencyPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import BreathingPage from "./pages/BreathingPage";
import BrainGamesPage from "./pages/BrainGamesPage";

import BlogsPage from "./pages/BlogsPage";
import BlogEditorPage from "./pages/BlogEditorPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import PublicBlogPage from "./pages/PublicBlogPage";

import {
  hasCompletedMoodGate,
  isAuthenticated,
  getStoredToken,
} from "./utils/storage";

function RequireAuth({ children }) {
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireMoodBeforeDashboard({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasCompletedMoodGate()) {
    return <Navigate to="/mood-quick" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public blog share route. Backend buildPublicBlogUrl() creates /blog/:shareToken. */}
        <Route path="/blog/:shareToken" element={<PublicBlogPage />} />

        {/* Comes right after login */}
        <Route
          path="/mood-quick"
          element={
            <RequireAuth>
              <MoodPage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireMoodBeforeDashboard>
              <DashboardPage />
            </RequireMoodBeforeDashboard>
          }
        />

        {/* Main mood check-in page */}
        <Route
          path="/mood"
          element={
            <RequireAuth>
              <MoodCheckinPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/perfect-day"
          element={
            <RequireAuth>
              <PerfectDaySchedulePage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/work-rest"
          element={
            <RequireAuth>
              <WorkRestPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/fitness"
          element={
            <RequireAuth>
              <FitnessPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/emergency"
          element={
            <RequireAuth>
              <EmergencyPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/breathing"
          element={
            <RequireAuth>
              <BreathingPage />
            </RequireAuth>
          }
        />

        <Route path="/app/brain-games/*" element={<BrainGamesPage />} />

        {/* =====================================================
            BLOG ROUTES
            IMPORTANT: /write is an explicit create route.
            It must NOT be treated as :blogId.
            ===================================================== */}

        <Route
          path="/app/blogs"
          element={
            <RequireAuth>
              <BlogsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/blogs/write"
          element={
            <RequireAuth>
              <BlogEditorPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/blogs/:blogId/edit"
          element={
            <RequireAuth>
              <BlogEditorPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/blogs/:blogId"
          element={
            <RequireAuth>
              <BlogDetailPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
