import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import MoodPage from "./pages/MoodPage";
import MoodCheckinPage from "./pages/MoodCheckinPage";
import {
  hasCompletedMoodGate,
  isAuthenticated,
} from "./utils/storage";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;