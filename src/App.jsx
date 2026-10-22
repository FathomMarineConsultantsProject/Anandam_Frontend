import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import DailyWisdomPage from "./pages/DailyWisdomPage";

import WellbeingQuestionnairesPage from "./pages/WellbeingQuestionnairesPage";
import WellbeingQuestionnairePage from "./pages/WellbeingQuestionnairePage";

// marketplace
import MarketplaceEntryPage from "./pages/MarketplaceEntryPage";
import PractitionerMarketplacePage from "./pages/PractitionerMarketplacePage";
import PractitionerSessionsPage from "./pages/PractitionerSessionsPage";
import PractitionerEnquiryDetailsPage from "./pages/PractitionerEnquiryDetailsPage";
import PractitionerProfilePage from "./pages/PractitionerProfilePage";
import SendEnquiryPage from "./pages/SendEnquiryPage";
import MyEnquiriesPage from "./pages/MyEnquiriesPage";
import EnquiryDetailsPage from "./pages/EnquiryDetailsPage";
import MyAppointmentsPage from "./pages/MyAppointmentsPage";
import VideoCallLobbyPage from "./pages/VideoCallLobbyPage";
import VideoCallRoomPage from "./pages/VideoCallRoomPage";
import PractitionerOnboardingPage from "./pages/PractitionerOnboardingPage";
import AppLayout from "./components/layout/AppLayout";

import {
  hasCompletedMoodGate,
  isAuthenticated,
  getStoredToken,
} from "./utils/storage";

import {
  getStoredAuthUser,
  getStoredPractitionerOnboarding,
} from "./api/authApi";

function practitionerNeedsOnboarding() {
  const user = getStoredAuthUser();
  const onboarding = getStoredPractitionerOnboarding();

  return (
    user?.role === "PRACTITIONER" &&
    onboarding?.completed !== true
  );
}

function RequireAuth({ children }) {
  const location = useLocation();
  const token = getStoredToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    practitionerNeedsOnboarding() &&
    location.pathname !== "/practitioner/onboarding"
  ) {
    return <Navigate to="/practitioner/onboarding" replace />;
  }

  return children;
}

function RequirePractitioner({ children }) {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredAuthUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "PRACTITIONER") {
    return <Navigate to="/marketplace" replace />;
  }

  if (
    practitionerNeedsOnboarding() &&
    location.pathname !== "/practitioner/onboarding"
  ) {
    return <Navigate to="/practitioner/onboarding" replace />;
  }

  return children;
}

function RequireNormalUser({ children }) {
  const token = getStoredToken();
  const user = getStoredAuthUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "PRACTITIONER") {
    return <Navigate to="/marketplace/practitioner" replace />;
  }

  return children;
}

function MoodQuickEntry() {
  const user = getStoredAuthUser();

  // Practitioners do not use the first-login mood gate as their landing page.
  // Incomplete practitioners are already intercepted by RequireAuth and sent
  // back to /practitioner/onboarding. Completed practitioners land on dashboard.
  if (user?.role === "PRACTITIONER") {
    return <Navigate to="/dashboard" replace />;
  }

  return <MoodPage />;
}

function RequireMoodBeforeDashboard({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (practitionerNeedsOnboarding()) {
    return <Navigate to="/practitioner/onboarding" replace />;
  }

  const user = getStoredAuthUser();

  // Practitioner onboarding is the practitioner gate. Once it is submitted,
  // the practitioner should land on the normal Anandam dashboard immediately.
  if (user?.role === "PRACTITIONER") {
    return children;
  }

  if (!hasCompletedMoodGate()) {
    return <Navigate to="/mood-quick" replace />;
  }

  return children;
}

function MarketplaceRoleEntry() {
  const user = getStoredAuthUser();

  if (user?.role === "PRACTITIONER") {
    return <Navigate to="/marketplace/practitioner" replace />;
  }

  return <MarketplaceEntryPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/blog/:shareToken" element={<PublicBlogPage />} />

        {/* PRACTITIONER AUTH / ONBOARDING - no AppLayout, matches Figma */}
        <Route
          path="/practitioner/onboarding"
          element={
            <RequirePractitioner>
              <PractitionerOnboardingPage />
            </RequirePractitioner>
          }
        />

        {/* MOOD GATE */}
        <Route path="/mood-quick" element={<RequireAuth><MoodQuickEntry /></RequireAuth>} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<RequireMoodBeforeDashboard><DashboardPage /></RequireMoodBeforeDashboard>} />

        {/* MAIN APP */}
        <Route path="/mood" element={<RequireAuth><MoodCheckinPage /></RequireAuth>} />
        <Route path="/app/perfect-day" element={<RequireAuth><PerfectDaySchedulePage /></RequireAuth>} />
        <Route path="/app/work-rest" element={<RequireAuth><WorkRestPage /></RequireAuth>} />
        <Route path="/app/fitness" element={<RequireAuth><FitnessPage /></RequireAuth>} />
        <Route path="/app/emergency" element={<RequireAuth><EmergencyPage /></RequireAuth>} />
        <Route path="/app/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/app/breathing" element={<RequireAuth><BreathingPage /></RequireAuth>} />
        <Route path="/app/brain-games/*" element={<RequireAuth><BrainGamesPage /></RequireAuth>} />
        <Route path="/app/sleep-stories" element={<RequireAuth><SleepStoriesPage /></RequireAuth>} />
        <Route path="/app/sleep-stories/:slug" element={<RequireAuth><SleepPlayerPage /></RequireAuth>} />

        {/* BLOGS */}
        <Route path="/app/blogs" element={<RequireAuth><BlogsPage /></RequireAuth>} />
        <Route path="/app/blogs/write" element={<RequireAuth><BlogEditorPage /></RequireAuth>} />
        <Route path="/app/blogs/:blogId/edit" element={<RequireAuth><BlogEditorPage /></RequireAuth>} />
        <Route path="/app/blogs/:blogId" element={<RequireAuth><BlogDetailPage /></RequireAuth>} />
        <Route path="/app/daily-wisdom" element={<RequireAuth><DailyWisdomPage /></RequireAuth>} />

        {/* WELLBEING QUESTIONNAIRES */}
        <Route path="/app/wellbeing" element={<RequireAuth><WellbeingQuestionnairesPage /></RequireAuth>} />
        <Route path="/app/wellbeing/:slug" element={<RequireAuth><WellbeingQuestionnairePage /></RequireAuth>} />

        {/* MARKETPLACE ENTRY - role aware */}
        <Route
          path="/marketplace"
          element={<RequireAuth><AppLayout><MarketplaceRoleEntry /></AppLayout></RequireAuth>}
        />

        {/* MARKETPLACE - NORMAL USER ONLY */}
        <Route
          path="/marketplace/practitioners/:slug"
          element={<RequireNormalUser><AppLayout><PractitionerProfilePage /></AppLayout></RequireNormalUser>}
        />
        <Route
          path="/marketplace/practitioners/:slug/enquire"
          element={<RequireNormalUser><AppLayout><SendEnquiryPage /></AppLayout></RequireNormalUser>}
        />
        <Route
          path="/marketplace/enquiries"
          element={<RequireNormalUser><AppLayout><MyEnquiriesPage /></AppLayout></RequireNormalUser>}
        />
        <Route
          path="/marketplace/enquiries/:enquiryId"
          element={<RequireNormalUser><AppLayout><EnquiryDetailsPage /></AppLayout></RequireNormalUser>}
        />
        <Route
          path="/marketplace/appointments"
          element={<RequireNormalUser><AppLayout><MyAppointmentsPage /></AppLayout></RequireNormalUser>}
        />

        {/* VIDEO - both roles are authorized by appointment ownership on backend */}
        <Route
          path="/marketplace/appointments/:appointmentId/join"
          element={<RequireAuth><AppLayout><VideoCallLobbyPage /></AppLayout></RequireAuth>}
        />
        <Route
          path="/marketplace/appointments/:appointmentId/call"
          element={<RequireAuth><AppLayout><VideoCallRoomPage /></AppLayout></RequireAuth>}
        />

        {/* MARKETPLACE - PRACTITIONER ONLY */}
        <Route
          path="/marketplace/practitioner"
          element={<RequirePractitioner><AppLayout><PractitionerMarketplacePage /></AppLayout></RequirePractitioner>}
        />
        <Route
          path="/marketplace/practitioner/sessions"
          element={<RequirePractitioner><AppLayout><PractitionerSessionsPage /></AppLayout></RequirePractitioner>}
        />
        <Route
          path="/marketplace/practitioner/enquiries/:enquiryId"
          element={<RequirePractitioner><AppLayout><PractitionerEnquiryDetailsPage /></AppLayout></RequirePractitioner>}
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
