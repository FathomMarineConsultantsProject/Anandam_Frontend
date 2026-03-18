import { apiRequest } from "./client";

function mapWorkload(value) {
  const map = {
    light: "Light",
    normal: "Moderate",
    heavy: "Heavy",
    overwhelming: "Overwhelming",
  };

  return map[value] || "Moderate";
<<<<<<< HEAD
}

function toFiveScale(value) {
  const numeric = Number(value) || 0;
  return Math.max(0, Math.min(5, Math.round(numeric / 2)));
=======
>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
}

export async function submitMoodCheckin(payload) {
  const emotionsText =
    Array.isArray(payload.emotions) && payload.emotions.length > 0
      ? `Emotions: ${payload.emotions.join(", ")}`
      : "";

<<<<<<< HEAD
  const notesText = payload.notes?.trim()
    ? `Notes: ${payload.notes.trim()}`
    : "";

  const journalText = payload.journalEntry?.trim()
    ? payload.journalEntry.trim()
    : "";

=======
  const notesText = payload.notes?.trim() ? `Notes: ${payload.notes.trim()}` : "";
  const journalText = payload.journalEntry?.trim()
    ? payload.journalEntry.trim()
    : "";

>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
  const combinedJournal = [journalText, notesText, emotionsText]
    .filter(Boolean)
    .join("\n\n");

  const response = await apiRequest("/mood/log", {
    method: "POST",
    body: JSON.stringify({
<<<<<<< HEAD
      moodScore: toFiveScale(payload.mood),
      energyLevel: toFiveScale(payload.energy),
      stressLevel: toFiveScale(payload.stress),
=======
      moodScore: payload.mood,
      energyLevel: payload.energy,
      stressLevel: payload.stress,
>>>>>>> 7342ba4f61b5cd40cd8a1009d012a1103e7000ba
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