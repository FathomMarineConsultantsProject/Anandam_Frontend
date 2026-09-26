import { apiRequest } from "./client";

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

export async function getBreathingTracks() {
  const response = await apiRequest(
    "/breathing/tracks",
    {
      method: "GET",
    }
  );

  const data = unwrapData(response);

  /*
    Supports either:

    {
      status: "success",
      count: 5,
      data: [...]
    }

    OR directly [...]
  */

  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.data)
  ) {
    return data.data;
  }

  return [];
}