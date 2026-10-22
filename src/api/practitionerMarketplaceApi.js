import { apiRequest } from "./client";

function queryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const value = search.toString();
  return value ? `?${value}` : "";
}

export function getPractitionerProfile() {
  return apiRequest("/practitioner/profile");
}

export function getPractitionerEnquiries(filters = {}) {
  return apiRequest(`/practitioner/enquiries${queryString(filters)}`);
}

export function getPractitionerEnquiryById(enquiryId) {
  return apiRequest(`/practitioner/enquiries/${encodeURIComponent(enquiryId)}`);
}

export function acceptOriginalRequestedTime(enquiryId) {
  return apiRequest(`/practitioner/enquiries/${encodeURIComponent(enquiryId)}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function proposePractitionerSessionTime(enquiryId, payload) {
  return apiRequest(`/practitioner/enquiries/${encodeURIComponent(enquiryId)}/proposals`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function acceptUserProposal(enquiryId, proposalId) {
  return apiRequest(
    `/practitioner/enquiries/${encodeURIComponent(enquiryId)}/proposals/${encodeURIComponent(proposalId)}/accept`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export function declineUserProposal(enquiryId, proposalId, payload = {}) {
  return apiRequest(
    `/practitioner/enquiries/${encodeURIComponent(enquiryId)}/proposals/${encodeURIComponent(proposalId)}/decline`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function declinePractitionerEnquiry(enquiryId, payload = {}) {
  return apiRequest(`/practitioner/enquiries/${encodeURIComponent(enquiryId)}/decline`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPractitionerAppointments(filters = {}) {
  return apiRequest(`/practitioner/appointments${queryString(filters)}`);
}

export function getPractitionerAppointmentById(appointmentId) {
  return apiRequest(`/practitioner/appointments/${encodeURIComponent(appointmentId)}`);
}
