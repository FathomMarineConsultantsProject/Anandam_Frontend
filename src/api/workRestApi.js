import { apiRequest } from "./client";

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

function normalizeWorkBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return Array(48).fill(false);
  }

  if (blocks.length === 48) {
    return blocks.map(Boolean);
  }

  const normalized = Array(48).fill(false);
  for (let i = 0; i < Math.min(blocks.length, 48); i += 1) {
    normalized[i] = Boolean(blocks[i]);
  }
  return normalized;
}

export async function fetchMasterWorkGrid(targetDate = DEFAULT_DATE) {
  const response = await apiRequest(`/work-hours/${targetDate}`, {
    method: "GET",
  });

  return (response?.data || []).map((member) => ({
    id: member.userId,
    userId: member.userId,
    name: member.fullName || "Unknown Crew",
    rank: member.rank || "Crew",
    workPeriods: normalizeWorkBlocks(member.workBlocks),
  }));
}

export async function saveDailyWorkGrid(targetDate = DEFAULT_DATE, workBlocks = []) {
  const response = await apiRequest("/work-hours", {
    method: "POST",
    body: JSON.stringify({
      targetDate,
      workBlocks: normalizeWorkBlocks(workBlocks),
    }),
  });

  return response?.data;
}

export async function getMyProfile() {
  const response = await apiRequest("/profile", {
    method: "GET",
  });

  return response?.data || null;
}