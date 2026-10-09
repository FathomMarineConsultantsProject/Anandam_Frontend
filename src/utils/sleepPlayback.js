const STORAGE_KEY = "anandam_sleep_progress";

export function getSavedSleepProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveSleepProgress({
  slug,
  positionSeconds,
  durationSeconds,
  title,
}) {
  if (!slug) {
    return;
  }

  const position = Math.max(
    0,
    Number(positionSeconds) || 0
  );

  const duration = Math.max(
    0,
    Number(durationSeconds) || 0
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        slug,
        title: title || "",
        positionSeconds: position,
        durationSeconds: duration,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Progress is best-effort only.
  }
}

export function clearSleepProgress(slug) {
  try {
    const current = getSavedSleepProgress();

    if (!current) {
      return;
    }

    if (!slug || current.slug === slug) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage errors.
  }
}

export function getSleepProgressPercent(progress) {
  const position =
    Number(progress?.positionSeconds) || 0;

  const duration =
    Number(progress?.durationSeconds) || 0;

  if (!duration) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      (position / duration) * 100
    )
  );
}