import { apiRequest } from "./client";

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

// Backend: app.use('/api/resorts', resortPublicRoutes)
// Only PUBLISHED, onboardingCompleted properties are returned by the backend.
export function listPublishedResorts(filters = {}) {
  return apiRequest(`/resorts${queryString(filters)}`);
}

export function getPublishedResort(slug) {
  return apiRequest(`/resorts/${encodeURIComponent(slug)}`);
}
