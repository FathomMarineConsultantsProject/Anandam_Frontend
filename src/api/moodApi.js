import { apiRequest } from "./client";
import { moodPageMockData } from "../data/moodData";

/* =====================================================
   HELPERS
   ===================================================== */

function mapMoodScoreToEmoji(score) {
  const numericScore = Number(score);

  if (numericScore === 1) return "😧";
  if (numericScore === 2) return "😟";
  if (numericScore === 3) return "😐";
  if (numericScore === 4) return "😊";
  if (numericScore === 5) return "😄";

  return "😐";
}

function mapMoodScoreToLabel(score) {
  const labels = {
    1: "Very low",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Great",
  };

  return labels[Number(score)] || "Okay";
}

function unwrapHistory(response) {
  /*
    Current backend response:

    {
      status: "success",
      count: 2,
      data: [...]
    }
  */

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  /*
    Fallback in case API client already
    unwraps response.data.
  */

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

function mapHistoryItem(item) {
  const score = Number(item?.moodScore);

  return {
    id:
      item?.id ||
      `mood-${Date.now()}-${Math.random()}`,

    createdAt:
      item?.loggedAt ||
      item?.createdAt ||
      new Date().toISOString(),

    moodValue: score,

    moodScore: score,

    emoji:
      mapMoodScoreToEmoji(score),

    label:
      item?.display?.mood ||
      mapMoodScoreToLabel(score),

    checkinType:
      item?.checkinType ||
      "QUICK",

    display:
      item?.display || {
        mood:
          mapMoodScoreToLabel(score),
      },
  };
}

/* =====================================================
   GET QUICK MOOD PAGE DATA
   GET /api/mood/history?type=QUICK
   ===================================================== */

export async function getMoodPageData() {
  let history = [];

  try {
    const response =
      await apiRequest(
        "/mood/history?type=QUICK&limit=20",
        {
          method: "GET",
        }
      );

    history =
      unwrapHistory(response).map(
        mapHistoryItem
      );
  } catch (error) {
    console.error(
      "Failed to load quick mood history:",
      error
    );

    /*
      We intentionally return an empty history
      instead of breaking the whole quick-mood page.
    */
    history = [];
  }

  return {
    ...moodPageMockData,
    history,
  };
}

/* =====================================================
   SUBMIT QUICK MOOD
   POST /api/mood/log

   QUICK sends ONLY:
   {
      checkinType: "QUICK",
      moodScore: 1-5
   }
   ===================================================== */

export async function submitMoodCheck(
  moodValue
) {
  const numericMood =
    Number(moodValue);

  if (
    !Number.isInteger(numericMood) ||
    numericMood < 1 ||
    numericMood > 5
  ) {
    throw new Error(
      "Please select a valid mood."
    );
  }

  const selectedMood =
    moodPageMockData.scale?.find(
      (item) =>
        Number(item.value) ===
        numericMood
    );

  const response =
    await apiRequest(
      "/mood/log",
      {
        method: "POST",

        body: JSON.stringify({
          checkinType: "QUICK",
          moodScore: numericMood,
        }),
      }
    );

  /*
    Backend POST response:

    {
      status: "success",
      message: "...",
      data: {...}
    }
  */

  const savedEntry =
    response?.data || response;

  /*
    Refresh only QUICK history.

    FULL mood check-ins should not appear
    in the post-login Quick Mood history.
  */

  let history = [];

  try {
    const historyResponse =
      await apiRequest(
        "/mood/history?type=QUICK&limit=20",
        {
          method: "GET",
        }
      );

    history =
      unwrapHistory(
        historyResponse
      ).map(mapHistoryItem);
  } catch (error) {
    console.error(
      "Mood saved, but failed to refresh quick history:",
      error
    );

    /*
      Saving succeeded, so do not treat history
      refresh failure as submission failure.
    */

    history = [
      mapHistoryItem({
        ...savedEntry,

        moodScore:
          savedEntry?.moodScore ??
          numericMood,

        loggedAt:
          savedEntry?.loggedAt ||
          new Date().toISOString(),

        checkinType:
          "QUICK",
      }),
    ];
  }

  return {
    success: true,

    entry:
      mapHistoryItem({
        ...savedEntry,

        moodScore:
          savedEntry?.moodScore ??
          numericMood,

        checkinType:
          "QUICK",
      }),

    history,

    selectedMood:
      selectedMood || {
        value: numericMood,
        emoji:
          mapMoodScoreToEmoji(
            numericMood
          ),
      },
  };
}

/* =====================================================
   GET SINGLE MOOD ENTRY
   GET /api/mood/:id

   Not needed by Quick Mood yet, but your backend
   already supports it and we'll need it for the
   full Mood page/history detail view.
   ===================================================== */

export async function getMoodLogById(id) {
  if (!id) {
    throw new Error(
      "Mood check-in ID is required."
    );
  }

  const response =
    await apiRequest(
      `/mood/${encodeURIComponent(id)}`,
      {
        method: "GET",
      }
    );

  return response?.data || response;
}