// App.jsx – updated with /app/fitness route
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MoodCheckinPage from "./pages/MoodCheckinPage";
import PerfectDaySchedulePage from "./pages/PerfectDaySchedulePage";
import WorkRestPage from "./pages/WorkRestPage";
import FitnessPage from "./pages/FitnessPage";            // ← NEW
import { hasCompletedMoodGate, isAuthenticated } from "./utils/storage";
import MoodPage from "./pages/MoodPage";
import EmergencyPage from "./pages/EmergencyPage";

function RequireAuth({ children }) {
  if (!isAuthenticated()) {
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

<<<<<<< ks/dev
        <Route
          path="/emergency"
          element={
            <RequireAuth>
              <EmergencyPage />
=======
        {/* ── NEW: Fitness page ── */}
        <Route
          path="/app/fitness"
          element={
            <RequireAuth>
              <FitnessPage />
>>>>>>> dev
            </RequireAuth>
          }
        />

<<<<<<< ks/dev
        {/* Back-compat for older nav links/bookmarks */}
        <Route path="/app/emergency" element={<Navigate to="/emergency" replace />} />

=======
>>>>>>> dev
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;