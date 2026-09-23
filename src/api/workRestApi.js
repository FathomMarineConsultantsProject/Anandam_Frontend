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

function getBackendCode(error) {
  return String(
    error?.data?.code ??
      error?.response?.data?.code ??
      ""
  ).trim();
}

export function getWorkRestErrorMessage(error, action = "general") {
  const status = getHttpStatus(error);
  const backendError = getBackendError(error);
  const backendCode = getBackendCode(error);

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
    if (/cannot end in the future|cannot end.*future|work session cannot end in the future/i.test(backendError)) {
      return "The selected end time is still in the future. Choose a time that has already passed and try again.";
    }

    if (/end time must be after start time/i.test(backendError)) {
      return "The end time must be later than the start time.";
    }

    if (/ship location is required|location.*required/i.test(backendError)) {
      return "Please choose or enter a work location before saving the work session.";
    }

    if (/ship location cannot exceed 100 characters/i.test(backendError)) {
      return "Work location must be 100 characters or fewer.";
    }

    if (/invalid start\/end date/i.test(backendError)) {
      return "The selected work time is not valid. Please choose the start and end time again.";
    }

    if (/invalid.*slot range|slotIndex|slot index/i.test(backendError)) {
      return "The selected time range is not valid. Please choose the time again.";
    }

    if (/comment cannot be empty/i.test(backendError)) {
      return "Please enter a note before saving.";
    }

    if (/comment cannot exceed 1000 characters/i.test(backendError)) {
      return "The note can contain up to 1000 characters.";
    }

    if (action === "manual") {
      return "That work session could not be saved. Check the start time, end time, and work location, then try again.";
    }

    if (action === "work-edit") {
      return "That work session could not be updated. Check the time range and work location, then try again.";
    }

    if (action === "clock-in") {
      return "We couldn't start this work session. Please choose a valid work location and try again.";
    }

    if (action === "comment") {
      return "The note could not be saved. Check the note and try again.";
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
    if (/work session not found/i.test(backendError)) {
      return "We couldn't find this work session. Refresh the day and try again.";
    }

    return "We couldn't find this work/rest record. Refresh the page and try again.";
  }

  if (status === 409) {
    if (
      backendCode === "WORK_SESSION_CONFLICT" ||
      /overlaps another work session/i.test(backendError)
    ) {
      return "This work session overlaps another work session. Choose a different start or end time and try again.";
    }

    if (
      backendCode === "REST_MEAL_CONFLICT" ||
      /overlaps a Rest or Meal|overlaps a Rest or Meal\/Tea\/Break/i.test(backendError)
    ) {
      return "This work time overlaps an existing Rest or Meal/Tea/Break entry. Edit or delete those slots first, then try again.";
    }

    if (/already have an active work session/i.test(backendError)) {
      return "You already have an active work session. Clock out of the current session before starting another one.";
    }

    if (/active work session cannot be edited/i.test(backendError)) {
      return "An active work session cannot be edited. Clock out first.";
    }

    if (/active work session cannot be deleted/i.test(backendError)) {
      return "An active work session cannot be deleted. Clock out first.";
    }

    if (/work time must be deleted through its work session/i.test(backendError)) {
      return "Work time must be deleted from the work session, not as an individual slot.";
    }

    if (action === "slot") {
      return "This time slot conflicts with an existing work entry. Refresh the record and choose another time.";
    }

    return backendError || "This change conflicts with an existing work/rest record. Refresh the page and try again.";
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

export async function deleteWorkRestSlot(date, slotIndex) {
  const response = await apiRequest(
    `/work-hours/day/${date}/slots/${slotIndex}`,
    {
      method: "DELETE",
    }
  );

  return unwrapData(response);
}

export async function updateWorkRestDayComment(date, comment) {
  const response = await apiRequest(`/work-hours/day/${date}/comment`, {
    method: "PATCH",
    body: JSON.stringify({ comment }),
  });

  return unwrapData(response);
}

export async function deleteWorkRestDayComment(date) {
  const response = await apiRequest(`/work-hours/day/${date}/comment`, {
    method: "DELETE",
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
  return apiRequest("/work-hours/sessions/manual", {
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
}

export async function updateExistingWorkSession(
  sessionId,
  {
    startedAt,
    endedAt,
    shipLocation,
    selectedDate,
    oldStartSlotIndex,
    oldEndSlotIndex,
    startSlotIndex,
    endSlotIndex,
  }
) {
  const response = await apiRequest(`/work-hours/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      startedAt,
      endedAt,
      shipLocation,
      selectedDate,
      oldStartSlotIndex,
      oldEndSlotIndex,
      startSlotIndex,
      endSlotIndex,
    }),
  });

  return {
    session: response?.data ?? null,
    day: response?.day ?? null,
    message: response?.message ?? "",
  };
}

export async function deleteExistingWorkSession(
  sessionId,
  { selectedDate, startSlotIndex, endSlotIndex }
) {
  const response = await apiRequest(`/work-hours/sessions/${sessionId}`, {
    method: "DELETE",
    body: JSON.stringify({
      selectedDate,
      startSlotIndex,
      endSlotIndex,
    }),
  });

  return {
    day: response?.day ?? null,
    message: response?.message ?? "",
  };
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
