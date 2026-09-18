// src/api/client.js

import {
  clearAuthSession,
  getStoredToken,
  getStoredRefreshToken,
  saveAuthSession,
} from "../utils/storage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://anandam-backend.vercel.app/api"
).replace(/\/$/, "");

/*
  Only ONE refresh request should run at a time.

  Example:
  Dashboard loads profile + mood + work/rest together.
  If access token expired, all 3 may receive 401.

  Without this protection they could all call /auth/refresh.
*/
let refreshPromise = null;


/* =====================================================
   API ERROR
   ===================================================== */

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = null,
      action = null,
      data = null,
    } = {}
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.action = action;
    this.data = data;
  }
}


/* =====================================================
   PARSE RESPONSE
   ===================================================== */

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}


/* =====================================================
   FRIENDLY ERROR MESSAGE
   ===================================================== */

export function getUserFriendlyError(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (!error) {
    return fallback;
  }

  const status =
    error?.status ||
    error?.response?.status ||
    0;

  const data =
    error?.data ||
    error?.response?.data ||
    {};

  const code =
    error?.code ||
    data?.code ||
    null;

  const backendMessage =
    data?.message ||
    data?.error ||
    "";

  /* ==================================================
     AUTH / SESSION ERRORS
     ================================================== */

  if (
    code === "ACCESS_TOKEN_MISSING" ||
    code === "ACCESS_TOKEN_INVALID" ||
    code === "SESSION_INVALID" ||
    code === "SESSION_EXPIRED" ||
    code === "REFRESH_TOKEN_MISSING"
  ) {
    return (
      backendMessage ||
      "Your session has expired. Please sign in again."
    );
  }

  /*
    Normally user won't see this because client.js
    automatically refreshes and retries.
  */
  if (
    code === "ACCESS_TOKEN_EXPIRED"
  ) {
    return "Your session is being refreshed. Please try again.";
  }


  /* ==================================================
     LOGIN
     ================================================== */

  if (
    status === 401 &&
    backendMessage ===
      "Invalid credentials"
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (
    status === 404 &&
    backendMessage ===
      "User not found"
  ) {
    return "No account was found with this email address.";
  }


  /* ==================================================
     KNOWN BACKEND MESSAGES

     Use the backend's exact useful explanation rather
     than replacing it with something generic.
     ================================================== */

  const looksTechnical =
    /^request failed/i.test(
      backendMessage
    ) ||
    /^error\s*\d+/i.test(
      backendMessage
    ) ||
    /^\d{3}\b/.test(
      backendMessage
    );

  if (
    backendMessage &&
    !looksTechnical
  ) {
    return backendMessage;
  }


  /* ==================================================
     HTTP STATUS FALLBACKS
     User NEVER sees "403", "409", "500", etc.
     ================================================== */

  switch (status) {
    case 400:
      return "Some of the information entered is not valid. Please check it and try again.";

    case 401:
      return "Your login session has expired. Please sign in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested information could not be found.";

    case 405:
      return "This action is not available right now. Please refresh the page and try again.";

    case 408:
      return "The request took too long. Please check your connection and try again.";

    case 409:
      return "This change conflicts with existing information. Please refresh the page and try again.";

    case 422:
      return "Some of the information entered could not be accepted. Please review it and try again.";

    case 429: {
      const retryAfter =
        data?.retryAfterSeconds;

      if (retryAfter) {
        return `Too many attempts. Please wait ${retryAfter} seconds before trying again.`;
      }

      return "Too many attempts. Please wait a moment and try again.";
    }

    case 500:
      return "Something went wrong on our side. Please try again.";

    case 502:
      return "The server is temporarily unavailable. Please try again in a moment.";

    case 503:
      return "The service is temporarily unavailable. Please try again shortly.";

    case 504:
      return "The server took too long to respond. Please try again.";

    default:
      break;
  }


  /* ==================================================
     NETWORK ERROR
     ================================================== */

  if (
    error instanceof TypeError ||
    /failed to fetch|network/i.test(
      error?.message || ""
    )
  ) {
    return "We couldn't connect to the server. Please check your internet connection and try again.";
  }

  return fallback;
}


/* =====================================================
   REDIRECT USER AFTER SESSION EXPIRY
   ===================================================== */

function redirectToLogin(message) {
  try {
    sessionStorage.setItem(
      "anandam_auth_notice",
      message ||
        "Your session has expired. Please sign in again."
    );
  } catch {
    // Ignore browser storage errors.
  }

  const path =
    window.location.pathname;

  const alreadyOnAuthPage =
    path === "/login" ||
    path === "/signup" ||
    path.startsWith("/forgot-password");

  if (!alreadyOnAuthPage) {
    window.location.replace("/login");
  }
}


/* =====================================================
   HANDLE INVALID SESSION
   ===================================================== */

function expireLocalSession(message) {
  clearAuthSession();

  redirectToLogin(
    message ||
      "Your session has expired. Please sign in again."
  );
}


/* =====================================================
   REFRESH ACCESS TOKEN
   ===================================================== */

async function performTokenRefresh() {
  const refreshToken =
    getStoredRefreshToken();

  if (!refreshToken) {
    throw new ApiError(
      "Your session has expired. Please sign in again.",
      {
        status: 401,
        code: "REFRESH_TOKEN_MISSING",
        action: "LOGIN_REQUIRED",
      }
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          refreshToken,
        }),
      }
    );
  } catch {
    /*
      IMPORTANT:
      Don't logout for a temporary network problem.
    */
    throw new ApiError(
      "We couldn't refresh your session. Please check your internet connection and try again."
    );
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getUserFriendlyError({
        status: response.status,
        data,
        code: data?.code,
      }),
      {
        status: response.status,
        code: data?.code,
        action: data?.action,
        data,
      }
    );
  }

  if (!data?.accessToken) {
    throw new ApiError(
      "Unable to refresh your session.",
      {
        status: 500,
        code: "REFRESH_FAILED",
        data,
      }
    );
  }

  /*
    Only replace access token.

    Refresh token remains the same because your backend
    does NOT rotate it on /auth/refresh.
  */

  saveAuthSession({
    token: data.accessToken,

    accessTokenExpiresInSeconds:
      data.accessTokenExpiresInSeconds,

    sessionExpiresAt:
      data.sessionExpiresAt,
  });

  return data.accessToken;
}


/* =====================================================
   SHARED REFRESH
   ===================================================== */

async function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise =
      performTokenRefresh().finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}


/* =====================================================
   API REQUEST
   ===================================================== */

export async function apiRequest(
  path,
  options = {}
) {
  const {
    skipAuthRefresh = false,
    skipAuth = false,
    _retry = false,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const accessToken =
  getStoredToken();

  const isFormData =
    fetchOptions.body instanceof FormData;

  const headers = {
    Accept: "application/json",

    ...(!isFormData &&
    fetchOptions.body !== undefined
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(!skipAuth && accessToken
      ? {
          Authorization:
            `Bearer ${accessToken}`,
        }
      : {}),

    ...customHeaders,
  };

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...fetchOptions,
        headers,
      }
    );
  } catch {
    throw new ApiError(
      "We couldn't connect to the server. Please check your internet connection and try again."
    );
  }

  const data =
    await parseResponse(response);

  if (response.ok) {
    return data;
  }


  /* ===================================================
     ACCESS TOKEN EXPIRED
     =================================================== */

  const shouldRefresh =
    response.status === 401 &&
    !skipAuthRefresh &&
    !_retry &&
    (
      data?.shouldRefresh === true ||
      data?.action ===
        "REFRESH_ACCESS_TOKEN" ||
      data?.code ===
        "ACCESS_TOKEN_EXPIRED"
    );

  if (shouldRefresh) {
    try {
      await refreshAccessTokenOnce();

      /*
        Retry original API call with newly saved token.
      */
      return apiRequest(path, {
        ...options,
        _retry: true,
      });

    } catch (refreshError) {

      /*
        Only destroy session when backend confirms
        refresh/login session itself is dead.

        DO NOT logout because of temporary 500/network errors.
      */

      const refreshStatus =
        refreshError?.status;

      const shouldLogout =
        refreshError?.data?.shouldLogout ===
          true ||
        refreshError?.action ===
          "LOGIN_REQUIRED" ||
        refreshStatus === 401;

      if (shouldLogout) {
        expireLocalSession(
          getUserFriendlyError(
            refreshError,
            "Your session has expired. Please sign in again."
          )
        );
      }

      throw refreshError;
    }
  }


  /* ===================================================
     LOGIN SESSION INVALID / REVOKED
     =================================================== */

  const shouldLogout =
    !skipAuthRefresh &&
    response.status === 401 &&
    (
      data?.shouldLogout === true ||
      data?.action === "LOGIN_REQUIRED" ||
      [
        "ACCESS_TOKEN_MISSING",
        "ACCESS_TOKEN_INVALID",
        "SESSION_INVALID",
        "SESSION_EXPIRED",
      ].includes(data?.code)
    );

  if (shouldLogout) {
    const message =
      getUserFriendlyError({
        status: response.status,
        data,
        code: data?.code,
      });

    expireLocalSession(message);
  }


  /* ===================================================
     THROW FRIENDLY ERROR
     =================================================== */

  throw new ApiError(
    getUserFriendlyError({
      status: response.status,
      data,
      code: data?.code,
    }),
    {
      status: response.status,
      code: data?.code,
      action: data?.action,
      data,
    }
  );
}