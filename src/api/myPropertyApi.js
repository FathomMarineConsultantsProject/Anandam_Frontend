/**
 * My Property API. Uses the existing shared apiRequest so Bearer tokens,
 * refresh/retry and login/session handling match the rest of Anandam.
 * The original resortOwnerApi.js used by onboarding is NOT replaced.
 */
import { apiRequest } from "./client";

const id = (value) => encodeURIComponent(String(value));
const propertyPath = (propertyId) => `/resort-owner/properties/${id(propertyId)}`;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const json = (method, body) => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

function validateFile(file) {
  if (!(file instanceof File)) throw new Error("Choose an image file.");
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG and WebP images are supported.");
  }
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Each image must be 5 MB or smaller.");
  }
}

async function uploadSignedFile(signed, file) {
  // The Vercel signed upload endpoint receives raw bytes and MUST NOT be
  // sent the Anandam Authorization header.
  const uploaded = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploaded.ok) {
    throw new Error(`Image upload failed (${uploaded.status}).`);
  }
}

export const myPropertyApi = {
  listProperties: () => apiRequest("/resort-owner/properties"),
  getProperty: (propertyId) => apiRequest(propertyPath(propertyId)),
  getCatalog: () => apiRequest("/resort-owner/catalog"),
  saveSection: (propertyId, section, data) =>
    apiRequest(`${propertyPath(propertyId)}/sections/${id(section)}`, json("PATCH", data)),
  publishProperty: (propertyId) =>
    apiRequest(`${propertyPath(propertyId)}/publish`, json("POST", { confirmedAccurate: true })),
  changeVisibility: (propertyId, status) =>
    apiRequest(`${propertyPath(propertyId)}/visibility`, json("PATCH", { status })),

  createRoom: (propertyId, data) =>
    apiRequest(`${propertyPath(propertyId)}/rooms`, json("POST", data)),
  updateRoom: (propertyId, roomId, data) =>
    apiRequest(`${propertyPath(propertyId)}/rooms/${id(roomId)}`, json("PATCH", data)),
  deleteRoom: (propertyId, roomId) =>
    apiRequest(`${propertyPath(propertyId)}/rooms/${id(roomId)}`, { method: "DELETE" }),
  listRoomUnits: (propertyId, roomId) =>
    apiRequest(`${propertyPath(propertyId)}/rooms/${id(roomId)}/units`),
  replaceRoomUnits: (propertyId, roomId, roomNumbers) =>
    apiRequest(`${propertyPath(propertyId)}/rooms/${id(roomId)}/units`, json("PUT", { roomNumbers })),

  async uploadImage(propertyId, file, kind = "PROPERTY", roomTypeId = null) {
    validateFile(file);
    if (kind === "ROOM" && !roomTypeId) throw new Error("Save the room before uploading its photos.");
    const base = propertyPath(propertyId);
    const metadata = {
      kind,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      ...(roomTypeId ? { roomTypeId } : {}),
    };
    const signed = await apiRequest(`${base}/images/presign`, json("POST", metadata));
    await uploadSignedFile(signed, file);
    return apiRequest(`${base}/images/confirm`, json("POST", {
      kind,
      pathname: signed.pathname,
      fileName: file.name,
      ...(roomTypeId ? { roomTypeId } : {}),
    }));
  },
  deleteImage: (propertyId, imageId) =>
    apiRequest(`${propertyPath(propertyId)}/images/${id(imageId)}`, { method: "DELETE" }),

  listEvents: (propertyId) => apiRequest(`${propertyPath(propertyId)}/events`),
  createEvent: (propertyId, data = {}) =>
    apiRequest(`${propertyPath(propertyId)}/events`, json("POST", data)),
  getEvent: (propertyId, eventId) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}`),
  updateEvent: (propertyId, eventId, data) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}`, json("PATCH", data)),
  publishEvent: (propertyId, eventId) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}/publish`, json("POST", {})),
  unpublishEvent: (propertyId, eventId) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}/unpublish`, json("POST", {})),
  deleteEvent: (propertyId, eventId) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}`, { method: "DELETE" }),
  async uploadEventImage(propertyId, eventId, file, kind = "COVER") {
    validateFile(file);
    const base = `${propertyPath(propertyId)}/events/${id(eventId)}/images`;
    const signed = await apiRequest(`${base}/presign`, json("POST", {
      kind, fileName: file.name, contentType: file.type, sizeBytes: file.size,
    }));
    await uploadSignedFile(signed, file);
    return apiRequest(`${base}/confirm`, json("POST", {
      kind, pathname: signed.pathname, fileName: file.name,
    }));
  },
  deleteEventImage: (propertyId, eventId, imageId) =>
    apiRequest(`${propertyPath(propertyId)}/events/${id(eventId)}/images/${id(imageId)}`, { method: "DELETE" }),

  getCalendar: (propertyId, { start, days = 14, roomTypeId } = {}) => {
    const query = new URLSearchParams({ days: String(days) });
    if (start) query.set("start", start);
    if (roomTypeId) query.set("roomTypeId", roomTypeId);
    return apiRequest(`${propertyPath(propertyId)}/calendar?${query.toString()}`);
  },
  blockDates: (propertyId, data) =>
    apiRequest(`${propertyPath(propertyId)}/calendar/blocks`, json("POST", data)),
  unblockDates: (propertyId, blockId) =>
    apiRequest(`${propertyPath(propertyId)}/calendar/blocks/${id(blockId)}`, { method: "DELETE" }),

  listGuestStays: (propertyId, { date, tab = "arrivals", search = "", page = 1 } = {}) => {
    const query = new URLSearchParams({ tab, page: String(page) });
    if (date) query.set("date", date);
    if (search) query.set("search", search);
    return apiRequest(`${propertyPath(propertyId)}/guest-stays?${query.toString()}`);
  },
  createGuestStay: (propertyId, data) =>
    apiRequest(`${propertyPath(propertyId)}/guest-stays`, json("POST", data)),
  updateGuestStay: (propertyId, stayId, data) =>
    apiRequest(`${propertyPath(propertyId)}/guest-stays/${id(stayId)}`, json("PATCH", data)),
  checkInGuest: (propertyId, stayId, data = {}) =>
    apiRequest(`${propertyPath(propertyId)}/guest-stays/${id(stayId)}/check-in`, json("POST", data)),
  checkOutGuest: (propertyId, stayId) =>
    apiRequest(`${propertyPath(propertyId)}/guest-stays/${id(stayId)}/check-out`, json("POST", {})),
  cancelGuest: (propertyId, stayId) =>
    apiRequest(`${propertyPath(propertyId)}/guest-stays/${id(stayId)}/cancel`, json("POST", {})),
};
