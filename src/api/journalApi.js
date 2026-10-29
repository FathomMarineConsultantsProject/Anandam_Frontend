import {
  apiRequest,
} from "./client";


export async function getJournalTemplates() {
  return apiRequest(
    "/journal/templates"
  );
}


export async function getJournalTemplate(
  slug
) {
  return apiRequest(
    `/journal/templates/${encodeURIComponent(
      slug
    )}`
  );
}


export async function getJournalEntries({
  status,
  search,
} = {}) {
  const params =
    new URLSearchParams();

  if (status) {
    params.set(
      "status",
      status
    );
  }

  if (search?.trim()) {
    params.set(
      "search",
      search.trim()
    );
  }

  const query =
    params.toString();

  return apiRequest(
    `/journal/entries${
      query
        ? `?${query}`
        : ""
    }`
  );
}


export async function getJournalEntry(
  entryId
) {
  return apiRequest(
    `/journal/entries/${entryId}`
  );
}


export async function createJournalEntry(
  payload
) {
  return apiRequest(
    "/journal/entries",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}


export async function updateJournalEntry(
  entryId,
  payload
) {
  return apiRequest(
    `/journal/entries/${entryId}`,
    {
      method:
        "PATCH",

      body:
        JSON.stringify(
          payload
        ),
    }
  );
}