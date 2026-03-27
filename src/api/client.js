import {
  getStoredToken,
  getStoredRefreshToken,
  saveAuthSession,
  clearAuthSession,
} from "../utils/storage";

const BASE_URL = "https://anandam-backend.vercel.app/api";

let refreshPromise = null;

async function doRefresh() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token.");
  }

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    clearAuthSession();
    throw new Error(json?.message || "Session expired.");
  }

  const newToken = json?.data?.accessToken;

  if (!newToken) {
    clearAuthSession();
    throw new Error("Refresh missing token.");
  }

  saveAuthSession({ token: newToken });

  return newToken;
}

export async function apiRequest(path, options = {}, _retry = false) {
  const { skipAuthRefresh = false, headers = {}, ...rest } = options;

  const token = skipAuthRefresh ? null : getStoredToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 401 && !skipAuthRefresh && !_retry) {
    try {
      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return apiRequest(path, options, true);
    } catch (error) {
      clearAuthSession();
      window.location.href = "/login";
      throw error;
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return null;
  }

  if (!res.ok) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }

  return json?.data ?? json;
}