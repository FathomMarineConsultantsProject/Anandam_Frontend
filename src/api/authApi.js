import { apiRequest } from "./client";

function createMockAuthResponse(payload = {}) {
  return {
    accessToken: "dev-access-token",
    refreshToken: "dev-refresh-token",
    user: {
      id: "dev-user-001",
      email: payload.email || "demo@anandam.app",
      fullName: payload.fullName || "Demo Seafarer",
      rank: payload.rank || "Officer",
      vessel: payload.vessel || "Demo Vessel",
    },
  };
}

export async function registerUser(payload) {
  try {
    return await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Register API unavailable, using mock auth.", error);
    return createMockAuthResponse(payload);
  }
}

export async function loginUser(payload) {
  try {
    return await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn("Login API unavailable, using mock auth.", error);
    return createMockAuthResponse(payload);
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    return await apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.warn("Refresh API unavailable, using mock token.", error);
    return {
      accessToken: "dev-access-token-refreshed",
    };
  }
}