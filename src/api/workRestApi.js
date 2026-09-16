import { apiRequest } from "./client";

function getHttpStatus(error) {
  const directStatus = Number(
    error?.status ??
      error?.statusCode ??
      error?.response?.status
  );

  if (Number.isFinite(directStatus) && directStatus >= 400) {
    return directStatus;
  }

  const message = String(error?.message || "");
  const match = message.match(/\b([45]\d{2})\b/);

  return match ? Number(match[1]) : null;
}

export function getWorkRestErrorMessage(error, action = "general") {
  const status = getHttpStatus(error);

  if (!status) {
    if (
      error?.name === "TypeError" ||
      /network|failed to fetch|fetch failed|offline/i.test(
        String(error?.message || "")
      )
    ) {
      return "We couldn't reach the server. Check your internet connection and try again.";
    }

    return "Something went wrong. Please try again.";
  }

  if (status === 400) {
    if (action === "manual") {
      return "That work session could not be saved. Check the start time, end time, and work location, then try again.";
    }

    if (action === "clock-in") {
      return "We couldn't start this work session. Please choose a valid work location and try again.";
    }

    if (action === "slot") {
      return "That time selection is not valid. Please choose the slot again and retry.";
    }

    return "Some of the information is not valid. Please check it and try again.";
  }

  if (status === 401) {
    return "Your login session has expired. Please sign in again to continue.";
  }

  if (status === 403) {
    return "Your session no longer has permission to make this change. Please sign in again. If the problem continues, contact your administrator.";
  }

  if (status === 404) {
    return "We couldn't find this work/rest record. Refresh the page and try again.";
  }

  if (status === 409) {
    if (action === "clock-in") {
      return "You already have an active work session. Clock out of the current session before starting another one.";
    }

    if (action === "manual") {
      return "This work session overlaps or conflicts with an existing work entry. Choose a different start or end time and try again.";
    }

    if (action === "slot") {
      return "This time slot conflicts with an existing work entry. Refresh the record and choose another time.";
    }

    return "This change conflicts with an existing work/rest record. Refresh the page and try again.";
  }

  if (status === 422) {
    return "Some details could not be accepted. Please check the selected time and work location, then try again.";
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }

  if (status === 500) {
    return "The server couldn't complete your request. Your changes were not saved. Please try again.";
  }

  if (status === 502 || status === 503 || status === 504) {
    return "The Anandam service is temporarily unavailable. Please wait a moment and try again.";
  }

  return "We couldn't complete that request. Please try again.";
}

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

export async function getWorkRestDay(date) {
  const response = await apiRequest(`/work-hours/day/${date}`, {
    method: "GET",
  });

  return unwrapData(response);
}

export async function updateWorkRestSlots(date, updates) {
  const response = await apiRequest(`/work-hours/day/${date}/slots`, {
    method: "PATCH",
    body: JSON.stringify({ updates }),
  });

  return unwrapData(response);
}

export async function getActiveWorkSession() {
  const response = await apiRequest("/work-hours/sessions/active", {
    method: "GET",
  });

  return unwrapData(response);
}

export async function clockInToWork(shipLocation) {
  const response = await apiRequest("/work-hours/sessions/clock-in", {
    method: "POST",
    body: JSON.stringify({ shipLocation }),
  });

  return unwrapData(response);
}

export async function clockOutOfWork() {
  const response = await apiRequest("/work-hours/sessions/clock-out", {
    method: "POST",
  });

  return unwrapData(response);
}

export async function createManualWorkSession({
  startedAt,
  endedAt,
  shipLocation,
}) {
  const response = await apiRequest("/work-hours/sessions/manual", {
    method: "POST",
    body: JSON.stringify({
      startedAt,
      endedAt,
      shipLocation,
    }),
  });

  return unwrapData(response);
}

export async function getWorkRestSummary(date) {
  const response = await apiRequest(`/work-hours/summary/${date}`, {
    method: "GET",
  });

  return unwrapData(response);
}

export async function getWorkRestHistory() {
  const response = await apiRequest("/work-hours/history", {
    method: "GET",
  });

  const data = unwrapData(response);

  return Array.isArray(data) ? data : [];
}
