import { apiRequest } from "./client";

function mapWorkload(value) {
  const map = {
    light: "Light",
    normal: "Moderate",
    heavy: "Heavy",
    overwhelming: "Overwhelming",
  };

  return map[value] || "Moderate";
}

export async function submitMoodCheckin(payload) {
  const emotionsText =
    Array.isArray(payload.emotions) && payload.emotions.length > 0
      ? `Emotions: ${payload.emotions.join(", ")}`
      : "";

  const notesText = payload.notes?.trim() ? `Notes: ${payload.notes.trim()}` : "";
  const journalText = payload.journalEntry?.trim()
    ? payload.journalEntry.trim()
    : "";

  const combinedJournal = [journalText, notesText, emotionsText]
    .filter(Boolean)
    .join("\n\n");

  const response = await apiRequest("/mood/log", {
    method: "POST",
    body: JSON.stringify({
      moodScore: payload.mood,
      energyLevel: payload.energy,
      stressLevel: payload.stress,
      hoursOfSleep: payload.sleepHours,
      currentWorkload: mapWorkload(payload.workload),
      journalEntry: combinedJournal || "Mood check-in submitted.",
    }),
  });

  return {
    success: true,
    entry: response?.data,
  };
}