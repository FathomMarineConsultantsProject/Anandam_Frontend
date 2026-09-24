// Use this only if /app/fitness is NOT already rendered inside AppLayout.
// Your AppLayout already renders the universal AppHeader + BottomNav/side-nav.

import { Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import FitnessPage from "./pages/FitnessPage";

export const fitnessRoute = (
  <Route
    path="/app/fitness"
    element={
      <AppLayout>
        <FitnessPage />
      </AppLayout>
    }
  />
);

// IMPORTANT:
// If your parent route already wraps ALL /app/* pages with AppLayout,
// then do NOT wrap AppLayout again. In that case use:
//
// <Route path="/app/fitness" element={<FitnessPage />} />
