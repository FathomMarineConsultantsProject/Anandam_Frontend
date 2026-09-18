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

function getBackendError(error) {
  return String(
    error?.data?.error ??
      error?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data?.message ??
      ""
  ).trim();
}

export function getWorkRestErrorMessage(error, action = "general") {
  const status = getHttpStatus(error);
  const backendError = getBackendError(error);

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
    if (/cannot end in the future/i.test(backendError)) {
      return "The selected end time is still in the future. Choose a time that has already passed and try again.";
    }

    if (/end time must be after start time/i.test(backendError)) {
      return "The end time must be later than the start time.";
    }

    if (/ship location is required|location.*required/i.test(backendError)) {
      return "Please choose a work location before saving the work session.";
    }

    if (/invalid start\/end date/i.test(backendError)) {
      return "The selected work time is not valid. Please choose the start and end time again.";
    }

    if (/slotIndex|slot index/i.test(backendError)) {
      return "The selected time slot is not valid. Please choose the time again.";
    }

    if (action === "manual") {
      return "That work session could not be saved. Check the start time, end time, and work location, then try again.";
    }

    if (action === "clock-in") {
      return "We couldn't start this work session. Please choose a valid work location and try again.";
    }

    if (action === "slot") {
      return "That time selection is not valid. Please choose the slot again and retry.";
    }

    return backendError || "Some of the information is not valid. Please check it and try again.";
  }

  if (status === 401) {
    return "Your login session has expired. Please sign in again to continue.";
  }

  if (status === 403) {
    return "You don't have permission to make this change. Please refresh the page and sign in again if needed.";
  }

  if (status === 404) {
    return "We couldn't find this work/rest record. Refresh the page and try again.";
  }

  if (status === 409) {
    if (/overlaps another work session/i.test(backendError)) {
      return "This work session overlaps an existing work session. Choose a different start or end time and try again.";
    }

    if (/already have an active work session/i.test(backendError)) {
      return "You already have an active work session. Clock out of the current session before starting another one.";
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

  return backendError || "We couldn't complete that request. Please try again.";
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
  selectedDate,
  startSlotIndex,
  endSlotIndex,
  timezoneOffsetMinutes,
}) {
  const response = await apiRequest("/work-hours/sessions/manual", {
    method: "POST",
    body: JSON.stringify({
      startedAt,
      endedAt,
      shipLocation,
      selectedDate,
      startSlotIndex,
      endSlotIndex,
      timezoneOffsetMinutes,
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
