const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const MOOD_GATE_KEY = "anandam_post_login_mood_done";

export function saveAuthSession(session) {
  const token = session?.token ?? session?.accessToken ?? null;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (session?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(MOOD_GATE_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export function resetMoodGate() {
  sessionStorage.setItem(MOOD_GATE_KEY, "false");
}

export function completeMoodGate() {
  sessionStorage.setItem(MOOD_GATE_KEY, "true");
}

export function hasCompletedMoodGate() {
  return sessionStorage.getItem(MOOD_GATE_KEY) === "true";
}