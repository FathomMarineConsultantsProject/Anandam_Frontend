import {
  apiRequest,
} from "./client";


// ======================================================
// MARKETPLACE
// ======================================================

export const getPractitioners = async (
  params = {}
) => {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value
        );
      }
    }
  );

  const queryString =
    query.toString();

  return apiRequest(
    `/marketplace/practitioners${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
};


export const getPractitionerBySlug = async (
  slug
) => {
  return apiRequest(
    `/marketplace/practitioners/${slug}`
  );
};


export const getMarketplaceSpecialties =
  async () => {
    return apiRequest(
      "/marketplace/specialties"
    );
  };


// ======================================================
// USER ENQUIRIES
// ======================================================

export const createEnquiry = async (
  data
) => {
  return apiRequest(
    "/enquiries",
    {
      method: "POST",

      body: JSON.stringify(
        data
      ),
    }
  );
};


export const getMyEnquiries =
  async () => {
    return apiRequest(
      "/enquiries/mine"
    );
  };


export const getMyEnquiryById = async (
  enquiryId
) => {
  return apiRequest(
    `/enquiries/${enquiryId}`
  );
};


// ======================================================
// PROPOSAL ACTIONS
// ======================================================

export const acceptProposal = async (
  enquiryId,
  proposalId
) => {
  return apiRequest(
    `/enquiries/${enquiryId}/proposals/${proposalId}/accept`,
    {
      method: "POST",
    }
  );
};


export const requestAnotherTime = async (
  enquiryId,
  proposalId,
  message
) => {
  return apiRequest(
    `/enquiries/${enquiryId}/proposals/${proposalId}/request-another-time`,
    {
      method: "POST",

      body: JSON.stringify({
        message,
      }),
    }
  );
};


export const declineProposal = async (
  enquiryId,
  proposalId,
  message
) => {
  return apiRequest(
    `/enquiries/${enquiryId}/proposals/${proposalId}/decline`,
    {
      method: "POST",

      body: JSON.stringify({
        message,
      }),
    }
  );
};


// ======================================================
// APPOINTMENTS
// ======================================================

export const getMyAppointments =
  async () => {
    return apiRequest(
      "/appointments/mine"
    );
  };


export const getMyAppointmentById = async (
  appointmentId
) => {
  return apiRequest(
    `/appointments/${appointmentId}`
  );
};