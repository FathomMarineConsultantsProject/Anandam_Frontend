import { apiRequest } from "./client";

function query(params = {}) {
  const url = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.set(key, String(value));
    }
  }
  return url.size ? `?${url.toString()}` : "";
}

// Uses the existing shared client and token-refresh/error-handling logic.
// The backend filters out draft/unpublished events and unpublished resorts.
export function listPublishedResortEvents(filters = {}) {
  return apiRequest(`/resorts/events${query(filters)}`);
}

export function getPublishedResortEvent(eventId) {
  return apiRequest(`/resorts/events/${encodeURIComponent(eventId)}`);
}
