// src/api/perfectDayApi.js
import { apiRequest } from "./client";

function unwrap(response) {
  if (
    response &&
    typeof response === "object" &&
    Object.prototype.hasOwnProperty.call(response, "data")
  ) {
    return response.data;
  }

  return response;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// =========================================================
// MY DAY
// =========================================================

export async function getDailyPlan(date = getLocalDateKey()) {
  const response = await apiRequest(`/daily-plan/day/${date}`, {
    method: "GET",
  });
  return unwrap(response);
}

export async function createDailyActivity(payload) {
  const response = await apiRequest("/daily-plan/activities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrap(response);
}

export async function updateDailyActivity(activityId, payload) {
  const response = await apiRequest(`/daily-plan/activities/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return unwrap(response);
}

export async function deleteDailyActivity(activityId) {
  return apiRequest(`/daily-plan/activities/${activityId}`, {
    method: "DELETE",
  });
}

export async function toggleDailyActivityStatus(activityId, isCompleted) {
  const response = await apiRequest(
    `/daily-plan/activities/${activityId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isCompleted }),
    }
  );
  return unwrap(response);
}

// =========================================================
// AVAILABLE TEMPLATES
// =========================================================

export async function getDailyTemplates() {
  const response = await apiRequest("/daily-plan/templates", {
    method: "GET",
  });
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

export async function applyDailyTemplate({
  templateId,
  templateType,
  targetDate,
  mode,
  activities,
}) {
  const payload = {
    templateId,
    templateType,
    targetDate,
  };

  if (mode) payload.mode = mode;
  if (Array.isArray(activities)) payload.activities = activities;

  const response = await apiRequest("/daily-plan/templates/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return unwrap(response);
}

// =========================================================
// MY TEMPLATES
// =========================================================

export async function getMyDayTemplates() {
  const response = await apiRequest("/daily-plan/my-templates", {
    method: "GET",
  });
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

export async function getMyDayTemplate(templateId) {
  const response = await apiRequest(`/daily-plan/my-templates/${templateId}`, {
    method: "GET",
  });
  return unwrap(response);
}

export async function createMyDayTemplate(payload) {
  const response = await apiRequest("/daily-plan/my-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrap(response);
}

export async function updateMyDayTemplate(templateId, payload) {
  const response = await apiRequest(`/daily-plan/my-templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return unwrap(response);
}

export async function deleteMyDayTemplate(templateId) {
  return apiRequest(`/daily-plan/my-templates/${templateId}`, {
    method: "DELETE",
  });
}

// =========================================================
// TEMPLATE ACTIVITY MANAGEMENT
// =========================================================

export async function addMyTemplateActivity(templateId, payload) {
  const response = await apiRequest(
    `/daily-plan/my-templates/${templateId}/activities`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return unwrap(response);
}

export async function updateMyTemplateActivity(
  templateId,
  activityId,
  payload
) {
  const response = await apiRequest(
    `/daily-plan/my-templates/${templateId}/activities/${activityId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
  return unwrap(response);
}

export async function deleteMyTemplateActivity(templateId, activityId) {
  return apiRequest(
    `/daily-plan/my-templates/${templateId}/activities/${activityId}`,
    {
      method: "DELETE",
    }
  );
}

// =========================================================
// PROGRESS
// =========================================================

export async function getPlannerProgress(days = 7) {
  const response = await apiRequest(
    `/daily-plan/progress?days=${encodeURIComponent(days)}`,
    { method: "GET" }
  );
  return unwrap(response);
}

// =========================================================
// TEMPORARY OLD-NAME COMPATIBILITY
// =========================================================

export async function getPerfectDaySchedule(targetDate = getLocalDateKey()) {
  return getDailyPlan(targetDate);
}

export async function getPerfectDayTemplates() {
  return getDailyTemplates();
}

export async function applyPerfectDayTemplate(
  templateId,
  targetDate,
  options = {}
) {
  const template =
    options.template ||
    (await getDailyTemplates()).find(
      (item) => String(item.id) === String(templateId)
    );

  return applyDailyTemplate({
    templateId,
    templateType: template?.templateType || "SYSTEM",
    targetDate,
    mode: options.mode,
    activities: options.activities,
  });
}

export async function togglePerfectDayActivity(activityId, isCompleted) {
  return toggleDailyActivityStatus(activityId, isCompleted);
}
