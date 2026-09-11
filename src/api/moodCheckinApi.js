import { apiRequest } from "./client";

/* =====================================================
   HELPERS
   ===================================================== */

/*
  Backend accepts:

  LIGHT
  BALANCED
  HEAVY
  OVERWHELMING
*/
function mapWorkload(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  const map = {
    light: "LIGHT",

    normal: "BALANCED",
    moderate: "BALANCED",
    balanced: "BALANCED",

    heavy: "HEAVY",

    overwhelming: "OVERWHELMING",
  };

  return map[normalized] || "BALANCED";
}


/*
  Current full Mood UI uses a larger scale
  and backend expects integers from 1-5.

  Examples:
  1  -> 1
  2  -> 1
  3  -> 2
  4  -> 2
  5  -> 3
  6  -> 3
  7  -> 4
  8  -> 4
  9  -> 5
  10 -> 5
*/
function toFiveScale(value) {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(numeric)
  ) {
    return null;
  }

  /*
    New redesigned UI already sends 1-5.
  */
  if (
    numeric >= 1 &&
    numeric <= 5
  ) {
    return Math.round(
      numeric
    );
  }

  /*
    Compatibility with any older
    0-10 components still remaining.
  */
  return Math.max(
    1,
    Math.min(
      5,
      Math.round(
        numeric / 2
      )
    )
  );
}


/*
  Convert frontend feeling names into the format
  accepted by backend.

  Example:
  "Very Happy" -> "VERY_HAPPY"
  "calm"       -> "CALM"
*/
function normalizeFeeling(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}


function normalizeFeelings(payload) {
  /*
    Support both names temporarily:

    payload.feelings -> preferred new name
    payload.emotions -> old frontend compatibility
  */

  const source = Array.isArray(payload?.feelings)
    ? payload.feelings
    : Array.isArray(payload?.emotions)
      ? payload.emotions
      : [];

  return [
    ...new Set(
      source
        .map(normalizeFeeling)
        .filter(Boolean)
    ),
  ];
}


function unwrapHistory(response) {
  /*
    Backend response:

    {
      status: "success",
      count: 10,
      data: [...]
    }
  */

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  /*
    Safe fallback if apiRequest is ever changed
    to return response.data directly.
  */
  if (Array.isArray(response)) {
    return response;
  }

  return [];
}


/* =====================================================
   SUBMIT FULL MOOD CHECK-IN

   POST /api/mood/log
   ===================================================== */

export async function submitMoodCheckin(payload) {
  const moodScore = toFiveScale(
    payload.mood
  );

  const energyLevel = toFiveScale(
    payload.energy
  );

  const stressLevel = toFiveScale(
    payload.stress
  );

  const sleepHours = Number(
    payload.sleepHours
  );

  /*
    Backend requires all of these for FULL:
    mood
    energy
    stress
    sleep
    workload
  */

  if (moodScore === null) {
    throw new Error(
      "Please select your mood."
    );
  }

  if (energyLevel === null) {
    throw new Error(
      "Please select your energy level."
    );
  }

  if (stressLevel === null) {
    throw new Error(
      "Please select your stress level."
    );
  }

  if (
    !Number.isFinite(sleepHours) ||
    sleepHours < 0 ||
    sleepHours > 12
  ) {
    throw new Error(
      "Sleep hours must be between 0 and 12."
    );
  }

  const feelings =
    normalizeFeelings(payload);

  /*
    Support old `notes` field and newer
    `additionalThoughts` field.
  */
  const additionalThoughts =
    payload.additionalThoughts?.trim() ||
    payload.notes?.trim() ||
    null;

  const journalEntry =
    payload.journalEntry?.trim() ||
    null;

  if (
    additionalThoughts &&
    additionalThoughts.length > 350
  ) {
    throw new Error(
      "Additional thoughts cannot exceed 350 characters."
    );
  }

  if (
    journalEntry &&
    journalEntry.length > 350
  ) {
    throw new Error(
      "Journal entry cannot exceed 350 characters."
    );
  }

  const response = await apiRequest(
    "/mood/log",
    {
      method: "POST",

      body: JSON.stringify({
        checkinType: "FULL",

        moodScore,
        energyLevel,
        stressLevel,

        hoursOfSleep: sleepHours,

        currentWorkload:
          mapWorkload(
            payload.workload
          ),

        feelings,

        additionalThoughts,

        journalEntry,
      }),
    }
  );

  return {
    success: true,

    entry:
      response?.data ||
      response,

    message:
      response?.message ||
      "Wellbeing check-in completed successfully.",
  };
}


/* =====================================================
   GET MOOD HISTORY

   Examples:

   getMoodHistory()
   -> QUICK + FULL

   getMoodHistory({
     type: "FULL"
   })

   getMoodHistory({
     type: "QUICK",
     limit: 20
   })

   Backend:
   GET /api/mood/history
   GET /api/mood/history?type=QUICK
   GET /api/mood/history?type=FULL
   ===================================================== */

export async function getMoodHistory({
  type,
  limit = 50,
} = {}) {
  const params =
    new URLSearchParams();

  if (type) {
    const normalizedType =
      String(type)
        .trim()
        .toUpperCase();

    if (
      normalizedType !== "QUICK" &&
      normalizedType !== "FULL"
    ) {
      throw new Error(
        "Mood history type must be QUICK or FULL."
      );
    }

    params.set(
      "type",
      normalizedType
    );
  }

  if (limit) {
    params.set(
      "limit",
      String(limit)
    );
  }

  const query =
    params.toString();

  const response =
    await apiRequest(
      `/mood/history${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
      }
    );

  return unwrapHistory(
    response
  );
}


/* =====================================================
   GET ONLY FULL CHECK-IN HISTORY
   Useful for the redesigned full Mood page
   ===================================================== */

export async function getFullMoodHistory(
  limit = 50
) {
  return getMoodHistory({
    type: "FULL",
    limit,
  });
}


/* =====================================================
   GET ONLY QUICK MOOD HISTORY
   ===================================================== */

export async function getQuickMoodHistory(
  limit = 50
) {
  return getMoodHistory({
    type: "QUICK",
    limit,
  });
}


/* =====================================================
   GET SINGLE MOOD CHECK-IN

   GET /api/mood/:id
   ===================================================== */

export async function getMoodCheckinById(
  id
) {
  if (!id) {
    throw new Error(
      "Mood check-in ID is required."
    );
  }

  const response =
    await apiRequest(
      `/mood/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
      }
    );

  return (
    response?.data ||
    response
  );
}


/* =====================================================
   DASHBOARD TODAY'S WELLNESS

   There is currently no separate dashboard-summary
   backend endpoint, so calculate it using history.

   Mood:
     latest QUICK or FULL entry with moodScore

   Energy:
     latest FULL entry with energyLevel

   Activities:
     number of mood/check-in records made today
     TEMPORARY until activity API is built
   ===================================================== */

export async function getDashboardWellness() {
  const history =
    await getMoodHistory({
      limit: 100,
    });

  if (!history.length) {
    return {
      moodScore: null,
      energyLevel: null,
      activities: 0,

      latestMoodAt: null,
      latestFullCheckinAt: null,
    };
  }

  /*
    Backend already sorts newest first,
    but keep this defensive sort.
  */
  const sorted = [...history].sort(
    (a, b) =>
      new Date(
        b.loggedAt
      ).getTime() -
      new Date(
        a.loggedAt
      ).getTime()
  );

  /*
    Mood may come from either:
    QUICK
    FULL
  */
  const latestMood =
    sorted.find(
      (item) =>
        item.moodScore !== null &&
        item.moodScore !== undefined
    );


  /*
    Energy must come from a FULL check-in.

    QUICK check-in deliberately stores
    energyLevel as null.
  */
  const latestFull =
    sorted.find(
      (item) =>
        item.checkinType === "FULL" &&
        item.energyLevel !== null &&
        item.energyLevel !== undefined
    );


  /* Today's activity/check-in count */

  const now = new Date();

  const todaysLogs =
    sorted.filter(
      (item) => {
        if (!item.loggedAt) {
          return false;
        }

        const date =
          new Date(
            item.loggedAt
          );

        return (
          date.getFullYear() ===
            now.getFullYear() &&
          date.getMonth() ===
            now.getMonth() &&
          date.getDate() ===
            now.getDate()
        );
      }
    );


  return {
    moodScore:
      latestMood?.moodScore !==
        undefined &&
      latestMood?.moodScore !==
        null
        ? Number(
            latestMood.moodScore
          )
        : null,

    energyLevel:
      latestFull?.energyLevel !==
        undefined &&
      latestFull?.energyLevel !==
        null
        ? Number(
            latestFull.energyLevel
          )
        : null,

    /*
      TEMPORARY:
      number of wellness check-ins today.

      Later we'll replace this with the
      real activity completion API.
    */
    activities:
      todaysLogs.length,

    latestMoodAt:
      latestMood?.loggedAt ||
      null,

    latestFullCheckinAt:
      latestFull?.loggedAt ||
      null,
  };
}