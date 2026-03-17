const AUTH_KEY = "anandam_auth_session";
const MOOD_GATE_KEY = "anandam_post_login_mood_done";

export function saveAuthSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function getAuthSession() {
  const raw = localStorage.getItem(AUTH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(MOOD_GATE_KEY);
}

export function isAuthenticated() {
  const session = getAuthSession();
  return Boolean(session?.accessToken);
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