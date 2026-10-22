import { apiRequest } from "./client";

export const PRACTITIONER_PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PRACTITIONER_DOCUMENT_MAX_BYTES = Math.floor(4.5 * 1024 * 1024);

export function getPractitionerOnboarding() {
  return apiRequest("/practitioner-onboarding");
}

export function savePractitionerBasicDetails(payload) {
  return apiRequest("/practitioner-onboarding/basic", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function savePractitionerProfessionalDetails(payload) {
  return apiRequest("/practitioner-onboarding/professional", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function savePractitionerOnlinePresence(payload) {
  return apiRequest("/practitioner-onboarding/online-presence", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function selectPractitionerAvatar(payload) {
  return apiRequest("/practitioner-onboarding/avatar", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getPractitionerOnboardingSpecialties() {
  return apiRequest("/practitioner-onboarding/specialties");
}

export async function uploadPractitionerFile({ file, kind, documentType = "SUPPORTING_DOCUMENT" }) {
  if (!file) throw new Error("Please choose a file.");
  const maxBytes =
    String(kind).toUpperCase() === "PROFILE_IMAGE"
      ? PRACTITIONER_PROFILE_IMAGE_MAX_BYTES
      : PRACTITIONER_DOCUMENT_MAX_BYTES;

  const maxLabel =
    String(kind).toUpperCase() === "PROFILE_IMAGE"
      ? "2 MB"
      : "4.5 MB";

  if (file.size > maxBytes) {
    throw new Error(`File must be ${maxLabel} or smaller.`);
  }

  const prepared = await apiRequest("/practitioner-onboarding/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      kind,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });

  const uploadResponse = await fetch(prepared.uploadUrl, {
    method: prepared.method || "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  return apiRequest("/practitioner-onboarding/uploads/confirm", {
    method: "POST",
    body: JSON.stringify({
      kind,
      pathname: prepared.pathname,
      fileName: file.name,
      documentType,
    }),
  });
}

export function getPractitionerDocumentDownloadUrl(documentId) {
  return apiRequest(`/practitioner-onboarding/documents/${documentId}/download-url`);
}

export function deletePractitionerDocument(documentId) {
  return apiRequest(`/practitioner-onboarding/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function submitPractitionerOnboarding() {
  return apiRequest("/practitioner-onboarding/submit", {
    method: "POST",
  });
}
