// api/workRestApi.js
// Backend: https://anandam-backend.vercel.app/api
// JWT token is read from localStorage under the key your app uses after login.
// Change "token" below if your app stores it under a different key.

const BASE_URL = "https://anandam-backend.vercel.app/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeWorkBlocks(blocks) {
  if (!Array.isArray(blocks)) return Array(48).fill(false);
  const out = Array(48).fill(false);
  for (let i = 0; i < Math.min(blocks.length, 48); i++) {
    out[i] = Boolean(blocks[i]);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/profile  →  logged-in user's profile
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyProfile() {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  const json = await res.json();
  return json?.data ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/work-hours/me/:date  →  this specific user's work blocks for the day
// Response shape (from image 3):
//   { status, data: { id, userId, date, workBlocks: boolean[48] } }
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchMyWorkGrid(targetDate) {
  const date = targetDate ?? new Date().toISOString().slice(0, 10);
  const res = await fetch(`${BASE_URL}/work-hours/me/${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  // 404 just means no record yet for today — treat as all-false
  if (res.status === 404) {
    return Array(48).fill(false);
  }

  if (!res.ok) throw new Error(`Work grid fetch failed: ${res.status}`);

  const json = await res.json();
  return normalizeWorkBlocks(json?.data?.workBlocks);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/work-hours  →  save/update the 48-slot boolean array for this user
// ─────────────────────────────────────────────────────────────────────────────
export async function saveDailyWorkGrid(targetDate, workBlocks) {
  const date = targetDate ?? new Date().toISOString().slice(0, 10);
  const res = await fetch(`${BASE_URL}/work-hours`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      targetDate: date,
      workBlocks: normalizeWorkBlocks(workBlocks),
    }),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  const json = await res.json();
  return json?.data ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Kept for compatibility — not used in WorkRestPage anymore
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchMasterWorkGrid(targetDate) {
  const date = targetDate ?? new Date().toISOString().slice(0, 10);
  const res = await fetch(`${BASE_URL}/work-hours/${date}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Master grid fetch failed: ${res.status}`);
  const json = await res.json();
  return (json?.data ?? []).map((m) => ({
    id: m.userId,
    userId: m.userId,
    name: m.fullName ?? "Unknown",
    rank: m.rank ?? "Crew",
    workPeriods: normalizeWorkBlocks(m.workBlocks),
  }));
}