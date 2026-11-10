import {
  apiRequest,
} from "./client";


function unwrapAccess(
  response
) {
  return (
    response?.access ??
    response?.data?.access ??
    response?.data ??
    response ??
    {}
  );
}


export async function getMySiteAccess() {
  const response =
    await apiRequest(
      "/site-access/me",
      {
        method: "GET",
      }
    );

  return unwrapAccess(
    response
  );
}


export async function activateMySiteAccess() {
  const response =
    await apiRequest(
      "/site-access/activate",
      {
        method: "POST",
      }
    );

  return unwrapAccess(
    response
  );
}