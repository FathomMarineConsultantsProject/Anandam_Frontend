import { apiRequest } from "./client";
import { saveAuthSession, clearAuthSession, getStoredRefreshToken } from "../utils/storage";

const AUTH_USER_KEY = "anandam_auth_user";
const PRACTITIONER_ONBOARDING_KEY = "anandam_practitioner_onboarding";

function persistAuthPayload(data) {
  saveAuthSession({
    token: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresInSeconds: data.accessTokenExpiresInSeconds,
    refreshTokenExpiresInSeconds: data.refreshTokenExpiresInSeconds,
    sessionExpiresAt: data.sessionExpiresAt,
  });

  if (data.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }

  if (data.practitionerOnboarding) {
    localStorage.setItem(
      PRACTITIONER_ONBOARDING_KEY,
      JSON.stringify(data.practitionerOnboarding)
    );
  } else {
    localStorage.removeItem(PRACTITIONER_ONBOARDING_KEY);
  }

  return data;
}

export function getStoredAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function getStoredPractitionerOnboarding() {
  try {
    return JSON.parse(localStorage.getItem(PRACTITIONER_ONBOARDING_KEY) || "null");
  } catch {
    return null;
  }
}

export function updateStoredPractitionerOnboarding(nextValue) {
  if (!nextValue) {
    localStorage.removeItem(PRACTITIONER_ONBOARDING_KEY);
    return;
  }
  localStorage.setItem(PRACTITIONER_ONBOARDING_KEY, JSON.stringify(nextValue));
}

export async function registerUser(payload) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    skipAuth: true,
    skipAuthRefresh: true,
    body: JSON.stringify(payload),
  });
  return persistAuthPayload(data);
}

export async function loginUser(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    skipAuth: true,
    skipAuthRefresh: true,
    body: JSON.stringify(payload),
  });
  return persistAuthPayload(data);
}

export async function logoutUser() {
  const refreshToken = getStoredRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest("/auth/logout", {
        method: "POST",
        skipAuthRefresh: true,
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    clearAuthSession();
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(PRACTITIONER_ONBOARDING_KEY);
  }
}

// Backward-friendly aliases.
export const register = registerUser;
export const login = loginUser;
export const logout = logoutUser;
