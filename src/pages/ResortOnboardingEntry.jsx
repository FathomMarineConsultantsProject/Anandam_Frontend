import { Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import ResortOnboardingPage from './ResortOnboardingPage';
import { peekResortSignup } from '../api/resortSignupDraft';
import { createResortDeferredApi } from '../api/resortDeferredApi';

/** New resort owners complete onboarding before backend registration.
 * Returning authenticated owners can still use the original API-driven route.
 */
export default function ResortOnboardingEntry({ getExistingAccessToken }) {
  const draftSignup = peekResortSignup();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const api = useMemo(()=>draftSignup ? createResortDeferredApi({ baseUrl: apiBaseUrl }) : null, [draftSignup, apiBaseUrl]);
  const existingToken = getExistingAccessToken?.() || '';
  if(!draftSignup && !existingToken) return <Navigate to='/signup' replace />;
  return <ResortOnboardingPage
    accessToken={existingToken}
    apiOverride={api}
    apiBaseUrl={apiBaseUrl}
  />;
}
