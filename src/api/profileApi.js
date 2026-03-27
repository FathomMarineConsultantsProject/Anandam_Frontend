import { apiRequest } from "./client";

export async function getMyProfile() {
  return apiRequest("/profile", { method: "GET" });
}

export async function getProfile() {
  return getMyProfile();
}

export async function updateMyProfile(payload) {
  return apiRequest("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload) {
  return updateMyProfile(payload);
}