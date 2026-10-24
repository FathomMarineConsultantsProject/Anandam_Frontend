import {
  apiRequest,
} from "./client";

export function getVideoCallStatus(
  appointmentId
) {
  return apiRequest(
    `/video/appointments/${appointmentId}/status`
  );
}

export function createVideoCallToken(
  appointmentId
) {
  return apiRequest(
    `/video/appointments/${appointmentId}/token`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export function markVideoCallConnected(
  appointmentId
) {
  return apiRequest(
    `/video/appointments/${appointmentId}/connected`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export function endVideoCall(
  appointmentId
) {
  return apiRequest(
    `/video/appointments/${appointmentId}/end`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export async function getVideoAppointmentDetails(
  appointmentId
) {
  try {
    return await apiRequest(
      `/appointments/${appointmentId}`
    );
  } catch (error) {
    if (
      error?.status !== 403 &&
      error?.status !== 404
    ) {
      throw error;
    }

    return apiRequest(
      `/practitioner/appointments/${appointmentId}`
    );
  }
}