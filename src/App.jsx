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

import JournalPage
  from "./pages/JournalPage";

import JournalTemplatePage
  from "./pages/JournalTemplatePage";

import JournalCustomPage
  from "./pages/JournalCustomPage";

import JournalEntriesPage
  from "./pages/JournalEntriesPage";

import PsychometricOverviewPage
  from "./pages/PsychometricOverviewPage";

import PsychometricDisclaimerPage
  from "./pages/PsychometricDisclaimerPage";

import PsychometricTestIntroPage
  from "./pages/PsychometricTestIntroPage";

import PsychometricAssessmentPage
  from "./pages/PsychometricAssessmentPage";

import PsychometricResultPage
  from "./pages/PsychometricResultPage";

import WellnessReminder
  from "./components/reminders/WellnessReminder";


/* =====================================================
   SITE ACCESS
   ===================================================== */

import {
  SiteAccessProvider,
} from "./context/SiteAccessContext";

import SiteAccessGate
  from "./components/access/SiteAccessGate";

import SiteAccessModal
  from "./components/access/SiteAccessModal";

import {
  WellbeingAccessProvider,
} from "./context/WellbeingAccessContext";

import WellbeingAccessGate
  from "./components/access/WellbeingAccessGate";

import WellbeingAccessModal
  from "./components/access/WellbeingAccessModal";


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
  const user =
    getStoredAuthUser();

  const onboarding =
    getStoredPractitionerOnboarding();


  return (
    user?.role ===
      "PRACTITIONER" &&
    onboarding?.completed !==
      true
  );
}


/* =====================================================
   AUTH
   ===================================================== */

function RequireAuth({
  children,
}) {
  const location =
    useLocation();

  const token =
    getStoredToken();


  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    practitionerNeedsOnboarding() &&
    location.pathname !==
      "/practitioner/onboarding"
  ) {
    return (
      <Navigate
        to="/practitioner/onboarding"
        replace
      />
    );
  }


  return children;
}


/* =====================================================
   AUTH + SITE SUBSCRIPTION
   ===================================================== */

function RequireSiteAccess({
  children,
}) {
  return (
    <RequireAuth>
      <SiteAccessGate>
        {children}
      </SiteAccessGate>
    </RequireAuth>
  );
}


/* =====================================================
   AUTH + WELLBEING ENTRY ACCESS

   Active 30-day Anandam pass:
   opens directly.

   No active pass:
   1 token is required for each new visit to Wellbeing.
   Internal /app/wellbeing/... navigation stays inside
   the same paid entry.
   ===================================================== */

function RequireWellbeingAccess({
  children,
}) {
  return (
    <RequireAuth>
      <WellbeingAccessGate>
        {children}
      </WellbeingAccessGate>
    </RequireAuth>
  );
}


/* =====================================================
   PRACTITIONER
   ===================================================== */

function RequirePractitioner({
  children,
}) {
  const location =
    useLocation();

  const token =
    getStoredToken();

  const user =
    getStoredAuthUser();


  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    user?.role !==
      "PRACTITIONER"
  ) {
    return (
      <Navigate
        to="/marketplace"
        replace
      />
    );
  }


  if (
    practitionerNeedsOnboarding() &&
    location.pathname !==
      "/practitioner/onboarding"
  ) {
    return (
      <Navigate
        to="/practitioner/onboarding"
        replace
      />
    );
  }


  return children;
}


/* =====================================================
   PRACTITIONER + SITE ACCESS
   ===================================================== */

function RequirePractitionerSiteAccess({
  children,
}) {
  return (
    <RequirePractitioner>
      <SiteAccessGate>
        {children}
      </SiteAccessGate>
    </RequirePractitioner>
  );
}


/* =====================================================
   NORMAL USER
   ===================================================== */

function RequireNormalUser({
  children,
}) {
  const token =
    getStoredToken();

  const user =
    getStoredAuthUser();


  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    user?.role ===
      "PRACTITIONER"
  ) {
    return (
      <Navigate
        to="/marketplace/practitioner"
        replace
      />
    );
  }


  return children;
}


/* =====================================================
   NORMAL USER + SITE ACCESS
   ===================================================== */

function RequireNormalUserSiteAccess({
  children,
}) {
  return (
    <RequireNormalUser>
      <SiteAccessGate>
        {children}
      </SiteAccessGate>
    </RequireNormalUser>
  );
}


/* =====================================================
   FIRST QUICK MOOD PAGE
   ALWAYS FREE
   ===================================================== */

function MoodQuickEntry() {
  const user =
    getStoredAuthUser();


  if (
    user?.role ===
      "PRACTITIONER"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return <MoodPage />;
}


/* =====================================================
   DASHBOARD GATE

   First login:
   QUICK mood -> dashboard.

   Dashboard itself does NOT require
   the 30-day site subscription.
   ===================================================== */

function RequireMoodBeforeDashboard({
  children,
}) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  if (
    practitionerNeedsOnboarding()
  ) {
    return (
      <Navigate
        to="/practitioner/onboarding"
        replace
      />
    );
  }


  const user =
    getStoredAuthUser();


  if (
    user?.role ===
      "PRACTITIONER"
  ) {
    return children;
  }


  if (
    !hasCompletedMoodGate()
  ) {
    return (
      <Navigate
        to="/mood-quick"
        replace
      />
    );
  }


  return children;
}


/* =====================================================
   MARKETPLACE ROLE ENTRY
   ===================================================== */

function MarketplaceRoleEntry() {
  const user =
    getStoredAuthUser();


  if (
    user?.role ===
      "PRACTITIONER"
  ) {
    return (
      <Navigate
        to="/marketplace/practitioner/sessions?tab=new"
        replace
      />
    );
  }


  return (
    <MarketplaceEntryPage />
  );
}


/* =====================================================
   ROUTES
   ===================================================== */

function AppRoutes() {
  return (
    <>
      <WellnessReminder />

      <SiteAccessModal />

      <WellbeingAccessModal />

      <Routes>

        {/* =================================================
            PUBLIC
            ================================================= */}

        <Route
          path="/"
          element={
            <LandingPage />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/signup"
          element={
            <SignupPage />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/blog/:shareToken"
          element={
            <PublicBlogPage />
          }
        />


        {/* =================================================
            PRACTITIONER ONBOARDING
            ================================================= */}

        <Route
          path="/practitioner/onboarding"
          element={
            <RequirePractitioner>
              <PractitionerOnboardingPage />
            </RequirePractitioner>
          }
        />


        {/* =================================================
            QUICK MOOD
            FREE
            ================================================= */}

        <Route
          path="/mood-quick"
          element={
            <RequireAuth>
              <MoodQuickEntry />
            </RequireAuth>
          }
        />


        {/* =================================================
            DASHBOARD
            FREE
            ================================================= */}

        <Route
          path="/dashboard"
          element={
            <RequireMoodBeforeDashboard>
              <DashboardPage />
            </RequireMoodBeforeDashboard>
          }
        />


        {/* =================================================
            PAID MAIN APP
            ================================================= */}

        <Route
          path="/mood"
          element={
            <RequireSiteAccess>
              <MoodCheckinPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/perfect-day"
          element={
            <RequireSiteAccess>
              <PerfectDaySchedulePage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/work-rest"
          element={
            <RequireSiteAccess>
              <WorkRestPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/fitness"
          element={
            <RequireSiteAccess>
              <FitnessPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/emergency"
          element={
            <RequireSiteAccess>
              <EmergencyPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/profile"
          element={
            <RequireSiteAccess>
              <ProfilePage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/breathing"
          element={
            <RequireSiteAccess>
              <BreathingPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/brain-games/*"
          element={
            <RequireSiteAccess>
              <BrainGamesPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/sleep-stories"
          element={
            <RequireSiteAccess>
              <SleepStoriesPage />
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/sleep-stories/:slug"
          element={
            <RequireSiteAccess>
              <SleepPlayerPage />
            </RequireSiteAccess>
          }
        />


        {/* =================================================
            JOURNAL
            PAID
            ================================================= */}

        <Route
          path="/app/journal"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/journal/template/:slug"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalTemplatePage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/journal/template/:slug/:entryId"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalTemplatePage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/journal/write"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalCustomPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/journal/write/:entryId"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalCustomPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/app/journal/entries"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <JournalEntriesPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />


        {/* =================================================
            BLOGS
            FREE
            ================================================= */}

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


        {/* =================================================
            DAILY WISDOM
            PAID
            ================================================= */}

        <Route
          path="/app/daily-wisdom"
          element={
            <RequireSiteAccess>
              <DailyWisdomPage />
            </RequireSiteAccess>
          }
        />


        {/* =================================================
            WELLBEING
            1-TOKEN ENTRY WITHOUT SITE PASS

            Active 30-day Anandam access includes Wellbeing.
            Existing psychometric test charges remain separate.
            ================================================= */}

        <Route
          path="/app/wellbeing"
          element={
            <RequireWellbeingAccess>
              <WellbeingQuestionnairesPage />
            </RequireWellbeingAccess>
          }
        />


        {/* PSYCHOMETRIC ENTRY */}

        <Route
          path="/app/wellbeing/psychometrics/:testCode"
          element={
            <RequireWellbeingAccess>
              <PsychometricTestIntroPage />
            </RequireWellbeingAccess>
          }
        />


        {/* PSYCHOMETRIC OVERVIEW */}

        <Route
          path="/app/wellbeing/psychometrics/:testCode/overview"
          element={
            <RequireWellbeingAccess>
              <PsychometricOverviewPage />
            </RequireWellbeingAccess>
          }
        />


        {/* DISCLAIMER */}

        <Route
          path="/app/wellbeing/psychometrics/:testCode/attempts/:attemptId/disclaimer"
          element={
            <RequireWellbeingAccess>
              <PsychometricDisclaimerPage />
            </RequireWellbeingAccess>
          }
        />


        {/* ASSESSMENT */}

        <Route
          path="/app/wellbeing/psychometrics/:testCode/attempts/:attemptId"
          element={
            <RequireWellbeingAccess>
              <PsychometricAssessmentPage />
            </RequireWellbeingAccess>
          }
        />


        {/* RESULTS */}

        <Route
          path="/app/wellbeing/psychometrics/:testCode/results/:attemptId"
          element={
            <RequireWellbeingAccess>
              <PsychometricResultPage />
            </RequireWellbeingAccess>
          }
        />


        {/* WELLBEING QUESTIONNAIRE */}

        <Route
          path="/app/wellbeing/:slug"
          element={
            <RequireWellbeingAccess>
              <WellbeingQuestionnairePage />
            </RequireWellbeingAccess>
          }
        />


        {/* =================================================
            MARKETPLACE
            PAID
            ================================================= */}

        <Route
          path="/marketplace"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <MarketplaceRoleEntry />
              </AppLayout>
            </RequireSiteAccess>
          }
        />


        {/* NORMAL USER MARKETPLACE */}

        <Route
          path="/marketplace/practitioners/:slug"
          element={
            <RequireNormalUserSiteAccess>
              <AppLayout>
                <PractitionerProfilePage />
              </AppLayout>
            </RequireNormalUserSiteAccess>
          }
        />

        <Route
          path="/marketplace/practitioners/:slug/enquire"
          element={
            <RequireNormalUserSiteAccess>
              <AppLayout>
                <SendEnquiryPage />
              </AppLayout>
            </RequireNormalUserSiteAccess>
          }
        />

        <Route
          path="/marketplace/enquiries"
          element={
            <RequireNormalUserSiteAccess>
              <AppLayout>
                <MyEnquiriesPage />
              </AppLayout>
            </RequireNormalUserSiteAccess>
          }
        />

        <Route
          path="/marketplace/enquiries/:enquiryId"
          element={
            <RequireNormalUserSiteAccess>
              <AppLayout>
                <EnquiryDetailsPage />
              </AppLayout>
            </RequireNormalUserSiteAccess>
          }
        />

        <Route
          path="/marketplace/appointments"
          element={
            <RequireNormalUserSiteAccess>
              <AppLayout>
                <MyAppointmentsPage />
              </AppLayout>
            </RequireNormalUserSiteAccess>
          }
        />


        {/* =================================================
            VIDEO
            PAID
            ================================================= */}

        <Route
          path="/marketplace/appointments/:appointmentId/join"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <VideoCallLobbyPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />

        <Route
          path="/marketplace/appointments/:appointmentId/call"
          element={
            <RequireSiteAccess>
              <AppLayout>
                <VideoCallRoomPage />
              </AppLayout>
            </RequireSiteAccess>
          }
        />


        {/* =================================================
            PRACTITIONER
            ================================================= */}

        <Route
          path="/marketplace/practitioner"
          element={
            <RequirePractitionerSiteAccess>
              <Navigate
                to="/marketplace/practitioner/sessions?tab=new"
                replace
              />
            </RequirePractitionerSiteAccess>
          }
        />

        <Route
          path="/marketplace/practitioner/sessions"
          element={
            <RequirePractitionerSiteAccess>
              <AppLayout>
                <PractitionerSessionsPage />
              </AppLayout>
            </RequirePractitionerSiteAccess>
          }
        />

        <Route
          path="/marketplace/practitioner/enquiries/:enquiryId"
          element={
            <RequirePractitionerSiteAccess>
              <AppLayout>
                <PractitionerEnquiryDetailsPage />
              </AppLayout>
            </RequirePractitionerSiteAccess>
          }
        />


        {/* FALLBACK */}

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
    </>
  );
}


/* =====================================================
   ROOT
   ===================================================== */

function App() {
  return (
    <BrowserRouter>
      <SiteAccessProvider>
        <WellbeingAccessProvider>
          <AppRoutes />
        </WellbeingAccessProvider>
      </SiteAccessProvider>
    </BrowserRouter>
  );
}


export default App;