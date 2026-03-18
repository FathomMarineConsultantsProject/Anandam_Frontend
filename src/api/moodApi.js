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
<<<<<<< HEAD
=======

>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
  let history = [];

  if (user?.id) {
    try {
      const response = await apiRequest(`/mood/history/${user.id}`, {
        method: "GET",
      });

      history = (response?.data || []).map(mapHistoryItem);
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

  await apiRequest("/mood/log", {
    method: "POST",
    body: JSON.stringify({
      moodScore: moodValue,
<<<<<<< HEAD
      energyLevel: moodValue,
      stressLevel: Math.max(0, 5 - moodValue),
      hoursOfSleep: 7.5,
=======
      energyLevel: Math.min(10, Math.max(1, moodValue * 2)),
      stressLevel: Math.min(10, Math.max(1, 6 - moodValue)),
      hoursOfSleep: 7,
>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
      currentWorkload: "Moderate",
      journalEntry: `Quick mood check submitted with score ${moodValue}.`,
    }),
  });

  const user = getCurrentUser();
<<<<<<< HEAD
  let history = [];

=======

  let history = [];
>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
  if (user?.id) {
    const historyResponse = await apiRequest(`/mood/history/${user.id}`, {
      method: "GET",
    });

    history = (historyResponse?.data || []).map(mapHistoryItem);
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