const RAW_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://anandam-backend.vercel.app/api";

const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

function getAccessToken() {
  return localStorage.getItem("token") || "";
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken") || "";
}

export function setAuthSession({ accessToken, refreshToken, user }) {
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthSession();
    throw new Error("No refresh token found");
  }

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    clearAuthSession();
    throw new Error(data?.message || "Session expired. Please login again.");
  }

  const newAccessToken = data?.accessToken || data?.data?.accessToken;

  if (!newAccessToken) {
    clearAuthSession();
    throw new Error("Refresh token response missing access token");
  }

  setAuthSession({ accessToken: newAccessToken });
  return newAccessToken;
}

export async function apiRequest(path, options = {}) {
  const {
    skipAuthRefresh = false,
    headers: customHeaders = {},
    ...restOptions
  } = options;

  const headers = {
    ...customHeaders,
  };

  if (!(restOptions.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...restOptions,
    headers,
  });

  if ((response.status === 401 || response.status === 403) && !skipAuthRefresh) {
    try {
      const newToken = await requestNewAccessToken();

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };

      response = await fetch(`${BASE_URL}${path}`, {
        ...restOptions,
        headers: retryHeaders,
      });
    } catch (refreshError) {
      clearAuthSession();
      throw refreshError;
    }
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { getAccessToken, getRefreshToken };