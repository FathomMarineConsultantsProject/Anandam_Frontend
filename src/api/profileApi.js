import { apiRequest } from "./client";

function syncStoredUser(profile) {
  if (!profile) return null;

  const existingRaw = localStorage.getItem("user");
  let existing = {};

  if (existingRaw) {
    try {
      existing = JSON.parse(existingRaw) || {};
    } catch {
      existing = {};
    }
  }

  const merged = {
    ...existing,
    ...profile,
  };

  localStorage.setItem("user", JSON.stringify(merged));
  return merged;
}

export async function getProfile() {
  const response = await apiRequest("/profile", {
    method: "GET",
  });

  const profile = response?.data || null;
  if (profile) syncStoredUser(profile);
  return profile;
}

export async function updateProfile(payload) {
  const response = await apiRequest("/profile/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const profile = response?.data || null;
  if (profile) syncStoredUser(profile);
  return profile;
}