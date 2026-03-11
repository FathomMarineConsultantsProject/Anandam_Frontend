const STORAGE_KEY = 'anandam_full_mood_checkins';

function readStoredCheckins() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeStoredCheckins(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function submitMoodCheckin(payload) {
  const newEntry = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const existing = readStoredCheckins();
  const updated = [newEntry, ...existing];

  writeStoredCheckins(updated);

  return {
    success: true,
    entry: newEntry,
  };
}

/*
Later replace with real API, for example:

export async function submitMoodCheckin(payload) {
  const response = await client.post('/mood-checkins', payload);
  return response.data;
}
*/