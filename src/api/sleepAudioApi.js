import { apiRequest } from "./client";

const SLEEP_AUDIO_ROOT = "/sleep-audio";

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

export function getSleepAudioErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  const backendMessage =
    error?.data?.error ||
    error?.response?.data?.error ||
    error?.error ||
    error?.message ||
    "";

  const status =
    error?.status ||
    error?.response?.status ||
    error?.statusCode ||
    null;

  if (status === 400) {
    return backendMessage || "Please check your request and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to access this audio.";
  }

  if (status === 404) {
    return backendMessage || "This sleep audio could not be found.";
  }

  if (status && status >= 500) {
    return "Sleep audio is temporarily unavailable. Please try again.";
  }

  return backendMessage || fallback;
}

export async function getSleepAudioTracks() {
  const response = await apiRequest(
    `${SLEEP_AUDIO_ROOT}/tracks`,
    {
      method: "GET",
    }
  );

  const data = unwrapData(response);

  return Array.isArray(data) ? data : [];
}

export async function getSleepAudioTrackBySlug(slug) {
  if (!slug) {
    throw new Error("Track slug is required");
  }

  const response = await apiRequest(
    `${SLEEP_AUDIO_ROOT}/tracks/${encodeURIComponent(slug)}`,
    {
      method: "GET",
    }
  );

  return unwrapData(response);
}