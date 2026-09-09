import { apiRequest } from "./client";

/*
  Backend returns:

  {
    status: "success",
    data: {...profile}
  }

  This helper gives components the actual profile object.
*/
function unwrapProfileResponse(response) {
  return (
    response?.data ||
    response?.user ||
    response
  );
}


/* ======================================================
   GET PROFILE
   GET /api/profile
   ====================================================== */

export async function getProfile() {
  const response = await apiRequest("/profile", {
    method: "GET",
  });

  return unwrapProfileResponse(response);
}


/*
  BACKWARD-COMPATIBILITY

  Some existing pages such as DashboardPage.jsx
  already import getMyProfile.

  Keep this export so those pages do not break.
*/
export async function getMyProfile() {
  return getProfile();
}


/* ======================================================
   UPDATE PROFILE
   PATCH /api/profile
   ====================================================== */

export async function updateProfile(payload) {
  const response = await apiRequest("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return unwrapProfileResponse(response);
}


/*
  Optional backward-compatible alias in case any older
  component uses updateMyProfile.
*/
export async function updateMyProfile(payload) {
  return updateProfile(payload);
}