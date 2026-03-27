import { apiRequest } from "./client";
import { moodPageMockData } from "../data/moodData";

function getCurrentUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapMoodScoreToEmoji(score) {
  if (score <= 1) return "😧";
  if (score <= 2) return "😟";
  if (score <= 3) return "😐";
  if (score <= 4) return "😊";
  return "😄";
}

function mapHistoryItem(item) {
  return {
    id: item.id,
    createdAt: item.loggedAt,
    moodValue: item.moodScore,
    emoji: mapMoodScoreToEmoji(item.moodScore),
  };
}

export async function getMoodPageData() {
  const user = getCurrentUser();
  let history = [];

  if (user?.id) {
    try {
      const response = await apiRequest(`/mood/history/${user.id}`, {
        method: "GET",
      });

      history = Array.isArray(response) ? response.map(mapHistoryItem) : [];
    } catch (error) {
      console.error("Failed to load mood history", error);
      history = [];
    }
  }

  return {
    ...moodPageMockData,
    history,
  };
}

export async function submitMoodCheck(moodValue) {
  const selectedMood = moodPageMockData.scale.find(
    (item) => item.value === moodValue
  );

  if (!selectedMood) {
    throw new Error("Invalid mood value");
  }

  const payload = {
    moodScore: moodValue,
    energyLevel: moodValue,
    stressLevel: Math.max(1, 6 - moodValue),
    hoursOfSleep: 7.5,
    currentWorkload: "Moderate",
    journalEntry: `Quick mood check submitted with score ${moodValue}.`,
  };

  console.log("Submitting quick mood payload:", payload);

  await apiRequest("/mood/log", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const user = getCurrentUser();
  let history = [];

  if (user?.id) {
    const historyResponse = await apiRequest(`/mood/history/${user.id}`, {
      method: "GET",
    });

    history = Array.isArray(historyResponse)
      ? historyResponse.map(mapHistoryItem)
      : [];
  }

  return {
    entry: {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      moodValue: selectedMood.value,
      emoji: selectedMood.emoji,
    },
    history,
  };
}