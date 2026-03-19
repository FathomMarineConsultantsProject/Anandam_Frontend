const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const MOOD_GATE_KEY = "anandam_post_login_mood_done";

export function saveAuthSession(session) {
  if (session?.accessToken) {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
  }

  if (session?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }

  if (session?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  }
}

export function getAuthSession() {
  const accessToken = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  let user = null;

  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  if (!accessToken && !refreshToken && !user) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export function getStoredUser() {
  return getAuthSession()?.user || null;
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(MOOD_GATE_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
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