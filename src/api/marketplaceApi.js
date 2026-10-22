import { apiRequest } from "./client";

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const result = search.toString();
  return result ? `?${result}` : "";
}

export function getPractitioners(filters = {}) {
  return apiRequest(`/marketplace/practitioners${queryString(filters)}`);
}

export function getPractitionerBySlug(slug) {
  return apiRequest(`/marketplace/practitioners/${encodeURIComponent(slug)}`);
}

export function getMarketplaceSpecialties() {
  return apiRequest("/marketplace/specialties");
}

export function createEnquiry(payload) {
  return apiRequest("/enquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyEnquiries() {
  return apiRequest("/enquiries/mine");
}

export function getMyEnquiryById(enquiryId) {
  return apiRequest(`/enquiries/${enquiryId}`);
}

export function acceptProposal(enquiryId, proposalId) {
  return apiRequest(`/enquiries/${enquiryId}/proposals/${proposalId}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function requestAnotherTime(enquiryId, proposalId, payload) {
  return apiRequest(`/enquiries/${enquiryId}/proposals/${proposalId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function rescheduleConfirmedAppointment(enquiryId, payload) {
  return apiRequest(`/enquiries/${enquiryId}/reschedule`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function declineProposal(enquiryId, proposalId, payload = {}) {
  return apiRequest(`/enquiries/${enquiryId}/proposals/${proposalId}/decline`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyAppointments() {
  return apiRequest("/appointments/mine");
}

export function getMyAppointmentById(appointmentId) {
  return apiRequest(`/appointments/${appointmentId}`);
}
