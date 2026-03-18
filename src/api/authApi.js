import { apiRequest } from "./client";

export async function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshAccessToken(refreshToken) {
  return apiRequest("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    skipAuthRefresh: true,
  });
}