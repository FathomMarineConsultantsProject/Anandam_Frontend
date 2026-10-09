import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

import SleepStoriesPage from "./pages/SleepStoriesPage";
import SleepPlayerPage from "./pages/SleepPlayerPage";

import {
  hasCompletedMoodGate,
  isAuthenticated,
  getStoredToken,
} from "./utils/storage";


function RequireAuth({ children }) {
  const token = getStoredToken();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function RequireMoodBeforeDashboard({ children }) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (!hasCompletedMoodGate()) {
    return (
      <Navigate
        to="/mood-quick"
        replace
      />
    );
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
            ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />


        {/* =====================================================
            PUBLIC BLOG SHARE ROUTE

            IMPORTANT:
            No RequireAuth here.

            Shared URL:
            https://your-domain.vercel.app/blog/:shareToken
            ===================================================== */}

        <Route
          path="/blog/:shareToken"
          element={<PublicBlogPage />}
        />


        {/* =====================================================
            MOOD GATE
            ===================================================== */}

        <Route
          path="/mood-quick"
          element={
            <RequireAuth>
              <MoodPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            DASHBOARD
            ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <RequireMoodBeforeDashboard>
              <DashboardPage />
            </RequireMoodBeforeDashboard>
          }
        />


        {/* =====================================================
            MOOD
            ===================================================== */}

        <Route
          path="/mood"
          element={
            <RequireAuth>
              <MoodCheckinPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            DAY PLANNER
            ===================================================== */}

        <Route
          path="/app/perfect-day"
          element={
            <RequireAuth>
              <PerfectDaySchedulePage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            WORK / REST
            ===================================================== */}

        <Route
          path="/app/work-rest"
          element={
            <RequireAuth>
              <WorkRestPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            FITNESS
            ===================================================== */}

        <Route
          path="/app/fitness"
          element={
            <RequireAuth>
              <FitnessPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            EMERGENCY
            ===================================================== */}

        <Route
          path="/app/emergency"
          element={
            <RequireAuth>
              <EmergencyPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            PROFILE
            ===================================================== */}

        <Route
          path="/app/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            BREATHING
            ===================================================== */}

        <Route
          path="/app/breathing"
          element={
            <RequireAuth>
              <BreathingPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            BRAIN GAMES
            ===================================================== */}

        <Route
          path="/app/brain-games/*"
          element={
            <RequireAuth>
              <BrainGamesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/sleep-stories"
          element={
            <RequireAuth>
              <SleepStoriesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/sleep-stories/:slug"
          element={
            <RequireAuth>
              <SleepPlayerPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            BLOGS
            ===================================================== */}

        <Route
          path="/app/blogs"
          element={
            <RequireAuth>
              <BlogsPage />
            </RequireAuth>
          }
        />


        {/* CREATE BLOG

            IMPORTANT:
            This must exist as an explicit route.

            Otherwise "write" could be interpreted
            as a blogId.
        */}

        <Route
          path="/app/blogs/write"
          element={
            <RequireAuth>
              <BlogEditorPage />
            </RequireAuth>
          }
        />


        {/* EDIT BLOG */}

        <Route
          path="/app/blogs/:blogId/edit"
          element={
            <RequireAuth>
              <BlogEditorPage />
            </RequireAuth>
          }
        />


        {/* VIEW BLOG */}

        <Route
          path="/app/blogs/:blogId"
          element={
            <RequireAuth>
              <BlogDetailPage />
            </RequireAuth>
          }
        />


        {/* =====================================================
            FALLBACK
            ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>


  );
}


export default App;