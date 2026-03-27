import { apiRequest } from "./client";

export async function loginUser(payload) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthRefresh: true,
  });

  return {
    token: data.accessToken ?? data.token,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}

export async function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuthRefresh: true,
  });
}

export async function refreshAccessToken(refreshToken) {
  return apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRefresh: true,
  });
}