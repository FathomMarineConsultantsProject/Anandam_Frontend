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


export async function activateMySiteAccess(
  tokenAmount
) {
  const options = {
    method: "POST",
  };


  if (
    tokenAmount !== undefined &&
    tokenAmount !== null &&
    tokenAmount !== ""
  ) {
    options.body =
      JSON.stringify({
        tokenAmount,
      });
  }


  const response =
    await apiRequest(
      "/site-access/activate",
      options
    );

  return unwrapAccess(
    response
  );
}