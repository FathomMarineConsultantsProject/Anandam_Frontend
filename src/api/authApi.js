import { apiRequest } from "./client";


function normalizeAuthResponse(data) {
  return {
    token:
      data?.accessToken ??
      data?.token ??
      null,

    refreshToken:
      data?.refreshToken ??
      null,

    user:
      data?.user ??
      null,

    accessTokenExpiresInSeconds:
      data?.accessTokenExpiresInSeconds ??
      null,

    refreshTokenExpiresInSeconds:
      data?.refreshTokenExpiresInSeconds ??
      null,

    sessionExpiresAt:
      data?.sessionExpiresAt ??
      null,
  };
}


/* =====================================================
   LOGIN
   ===================================================== */

export async function loginUser(
  payload
) {
  const data =
    await apiRequest(
      "/auth/login",
      {
        method: "POST",

        body:
          JSON.stringify(payload),

        /*
          A 401 here means bad credentials,
          NOT an expired current session.
        */
        skipAuthRefresh: true,
        skipAuth: true,
      }
    );

  return normalizeAuthResponse(data);
}


/* =====================================================
   REGISTER
   Backend now returns tokens immediately.
   ===================================================== */

export async function registerUser(
  payload
) {
  const data =
    await apiRequest(
      "/auth/register",
      {
        method: "POST",

        body:
          JSON.stringify(payload),

        skipAuthRefresh: true,
        skipAuth: true,
      }
    );

  return normalizeAuthResponse(data);
}


/* =====================================================
   MANUAL REFRESH
   Normally client.js handles this automatically.
   ===================================================== */

export async function refreshAccessToken(
  refreshToken
) {
  return apiRequest(
    "/auth/refresh",
    {
      method: "POST",

      body:
        JSON.stringify({
          refreshToken,
        }),

      skipAuthRefresh: true,
      skipAuth: true,
    }
  );
}


/* =====================================================
   LOGOUT
   ===================================================== */

export async function logoutUser(
  refreshToken
) {
  if (!refreshToken) {
    return null;
  }

  return apiRequest(
    "/auth/logout",
    {
      method: "POST",

      body:
        JSON.stringify({
          refreshToken,
        }),

      /*
        User is trying to logout anyway.
        Don't try refreshing a token just to logout.
      */
      skipAuthRefresh: true,
      skipAuth: true,
    }
  );
}