import { apiRequest } from "./client";

const FITNESS_ROOT = "/fitness";

function unwrapData(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
}

function appendQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}

function getHttpStatus(error) {
  const status = Number(
    error?.status ??
      error?.statusCode ??
      error?.response?.status
  );

  return Number.isFinite(status) ? status : null;
}

function getBackendMessage(error) {
  return String(
    error?.data?.error ??
      error?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data?.message ??
      error?.message ??
      ""
  ).trim();
}

export function getFitnessErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  const status = getHttpStatus(error);
  const backendMessage = getBackendMessage(error);

  if (status === 401) {
    return "Your login session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to access this fitness feature.";
  }

  if (status === 404) {
    return backendMessage || "This workout could not be found.";
  }

  if (status === 409) {
    return backendMessage || "This workout session can no longer be changed.";
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "The fitness service is temporarily unavailable. Please try again.";
  }

  if (
    !status &&
    /network|failed to fetch|fetch failed|offline/i.test(
      String(error?.message || "")
    )
  ) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  return backendMessage || fallback;
}

export async function getFitnessOverview() {
  const response = await apiRequest(`${FITNESS_ROOT}/overview`, {
    method: "GET",
  });

  return unwrapData(response);
}

export async function getFitnessWorkouts(filters = {}) {
  const query = appendQuery({
    type: filters.type,
    category: filters.category,
    difficulty: filters.difficulty,
    minDuration: filters.minDuration,
    maxDuration: filters.maxDuration,
  });

  const response = await apiRequest(
    `${FITNESS_ROOT}/workouts${query}`,
    {
      method: "GET",
    }
  );

  return unwrapData(response) || [];
}

export async function getFitnessWorkoutById(workoutId) {
  const response = await apiRequest(
    `${FITNESS_ROOT}/workouts/${encodeURIComponent(workoutId)}`,
    {
      method: "GET",
    }
  );

  return unwrapData(response);
}

export async function startFitnessWorkout(
  workoutId,
  confirmedEquipment = []
) {
  const response = await apiRequest(
    `${FITNESS_ROOT}/workouts/${encodeURIComponent(workoutId)}/start`,
    {
      method: "POST",
      body: JSON.stringify({ confirmedEquipment }),
    }
  );

  return unwrapData(response);
}

export async function getActiveFitnessSession(workoutId = "") {
  const query = appendQuery({ workoutId });

  const response = await apiRequest(
    `${FITNESS_ROOT}/sessions/active${query}`,
    {
      method: "GET",
    }
  );

  return unwrapData(response);
}

export async function updateFitnessProgress(
  sessionId,
  { positionSeconds, progressPercent } = {}
) {
  const payload = {};

  if (positionSeconds !== undefined) {
    payload.positionSeconds = positionSeconds;
  }

  if (progressPercent !== undefined) {
    payload.progressPercent = progressPercent;
  }

  const response = await apiRequest(
    `${FITNESS_ROOT}/sessions/${encodeURIComponent(sessionId)}/progress`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  return unwrapData(response);
}

export async function completeFitnessSession(sessionId) {
  const response = await apiRequest(
    `${FITNESS_ROOT}/sessions/${encodeURIComponent(sessionId)}/complete`,
    {
      method: "POST",
    }
  );

  return unwrapData(response);
}

export async function endFitnessSession(sessionId) {
  const response = await apiRequest(
    `${FITNESS_ROOT}/sessions/${encodeURIComponent(sessionId)}/end`,
    {
      method: "POST",
    }
  );

  return unwrapData(response);
}

export async function getFitnessHistory({
  page = 1,
  limit = 20,
  type = "",
  difficulty = "",
} = {}) {
  const query = appendQuery({
    page,
    limit,
    type,
    difficulty,
  });

  return apiRequest(`${FITNESS_ROOT}/history${query}`, {
    method: "GET",
  });
}
