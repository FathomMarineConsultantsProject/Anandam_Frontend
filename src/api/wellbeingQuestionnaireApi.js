import { apiRequest } from "./client";

const QUESTIONNAIRE_ROOT = "/wellbeing-questionnaires";

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

export function getWellbeingQuestionnaireErrorMessage(
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
    return (
      backendMessage ||
      "Please check your answers and try again."
    );
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to access this questionnaire.";
  }

  if (status === 404) {
    return (
      backendMessage ||
      "This wellbeing questionnaire could not be found."
    );
  }

  if (status === 409) {
    return (
      backendMessage ||
      "You have already completed this questionnaire for the current period."
    );
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "The wellbeing service is temporarily unavailable. Please try again.";
  }

  return backendMessage || fallback;
}


// ======================================================
// GET ALL QUESTIONNAIRES
// ======================================================

export async function getWellbeingQuestionnaires() {
  const response = await apiRequest(
    QUESTIONNAIRE_ROOT,
    {
      method: "GET",
    }
  );

  const data = unwrapData(response);

  return Array.isArray(data)
    ? data
    : [];
}


// ======================================================
// GET ONE QUESTIONNAIRE
// ======================================================

export async function getWellbeingQuestionnaireBySlug(
  slug
) {
  const response = await apiRequest(
    `${QUESTIONNAIRE_ROOT}/${encodeURIComponent(slug)}`,
    {
      method: "GET",
    }
  );

  return unwrapData(response);
}


// ======================================================
// SUBMIT COMPLETE QUESTIONNAIRE
// ======================================================

export async function submitWellbeingQuestionnaire(
  slug,
  answers
) {
  const response = await apiRequest(
    `${QUESTIONNAIRE_ROOT}/${encodeURIComponent(
      slug
    )}/submit`,
    {
      method: "POST",

      body: JSON.stringify({
        answers,
      }),
    }
  );

  return unwrapData(response);
}


// ======================================================
// HISTORY
// ======================================================

export async function getWellbeingQuestionnaireHistory(
  slug
) {
  const response = await apiRequest(
    `${QUESTIONNAIRE_ROOT}/${encodeURIComponent(
      slug
    )}/history`,
    {
      method: "GET",
    }
  );

  const data = unwrapData(response);

  return Array.isArray(data)
    ? data
    : [];
}