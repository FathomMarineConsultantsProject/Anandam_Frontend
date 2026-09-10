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

function toFiveScale(value) {
  const numeric = Number(value) || 0;
  return Math.max(0, Math.min(5, Math.round(numeric / 2)));
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* =====================================================
   SUBMIT FULL MOOD CHECK-IN
   POST /api/mood/log
   ===================================================== */

export async function submitMoodCheckin(payload) {
  const emotionsText =
    Array.isArray(payload.emotions) && payload.emotions.length > 0
      ? `Emotions: ${payload.emotions.join(", ")}`
      : "";

  const notesText = payload.notes?.trim()
    ? `Notes: ${payload.notes.trim()}`
    : "";

  const journalText = payload.journalEntry?.trim()
    ? payload.journalEntry.trim()
    : "";

  const combinedJournal = [
    journalText,
    notesText,
    emotionsText,
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await apiRequest("/mood/log", {
    method: "POST",
    body: JSON.stringify({
      moodScore: toFiveScale(payload.mood),
      energyLevel: toFiveScale(payload.energy),
      stressLevel: toFiveScale(payload.stress),
      hoursOfSleep: payload.sleepHours,
      currentWorkload: mapWorkload(payload.workload),
      journalEntry:
        combinedJournal || "Mood check-in submitted.",
    }),
  });

  return {
    success: true,
    entry: response?.data || response,
  };
}

/* =====================================================
   GET MOOD HISTORY
   GET /api/mood/history/:userId
   ===================================================== */

export async function getMoodHistory() {
  const user = getStoredUser();

  if (!user?.id) {
    return [];
  }

  const response = await apiRequest(
    `/mood/history/${user.id}`,
    {
      method: "GET",
    }
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

/* =====================================================
   DASHBOARD TODAY'S WELLNESS
   ===================================================== */

export async function getDashboardWellness() {
  const history = await getMoodHistory();

  if (!history.length) {
    return {
      moodScore: null,
      energyLevel: null,
      activities: 0,
    };
  }

  /*
    Backend already returns loggedAt DESC,
    but sort again here so dashboard stays safe.
  */
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.loggedAt).getTime() -
      new Date(a.loggedAt).getTime()
  );

  const latest = sorted[0];

  const now = new Date();

  const todaysLogs = sorted.filter((item) => {
    if (!item.loggedAt) {
      return false;
    }

    const date = new Date(item.loggedAt);

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  });

  return {
    moodScore:
      latest?.moodScore !== undefined &&
      latest?.moodScore !== null
        ? Number(latest.moodScore)
        : null,

    energyLevel:
      latest?.energyLevel !== undefined &&
      latest?.energyLevel !== null
        ? Number(latest.energyLevel)
        : null,

    /*
      IMPORTANT:
      Your current backend does NOT have an activities field.

      For now this represents how many wellness/mood entries
      the user made today.

      When you create a real activity-completion API,
      replace this value with that API's count.
    */
    activities: todaysLogs.length,
  };
}