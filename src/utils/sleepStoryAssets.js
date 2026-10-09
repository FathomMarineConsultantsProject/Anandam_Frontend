/*
  ============================================================
  ANANDAM
  SLEEP STORY + SLEEP SOUND PRESET ARTWORK
  ============================================================

  Stories:
  src/assets/sleep stories/

  Sounds:
  src/assets/sleep sounds/

  Add new images into either folder and Vite will
  automatically include them in the next build.

  No manual imports are required.
*/


// ============================================================
// STORY ILLUSTRATIONS
// ============================================================

const storyModules = import.meta.glob(
  "../assets/sleep stories/*.{png,jpg,jpeg,webp,avif,svg,gif,PNG,JPG,JPEG,WEBP,AVIF,SVG,GIF}",
  {
    eager: true,
    import: "default",
  }
);


// ============================================================
// SLEEP SOUND ILLUSTRATIONS
// ============================================================

const soundModules = import.meta.glob(
  "../assets/sleep sounds/*.{png,jpg,jpeg,webp,avif,svg,gif,PNG,JPG,JPEG,WEBP,AVIF,SVG,GIF}",
  {
    eager: true,
    import: "default",
  }
);


// ============================================================
// HELPERS
// ============================================================

function getFileName(path = "") {
  return String(path)
    .split("/")
    .pop() || "";
}


function buildAssetList(modules = {}) {
  return Object.entries(modules)
    .map(([path, src]) => ({
      path,
      src,
      name: getFileName(path),
    }))
    .filter((item) => Boolean(item.src))
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        }
      )
    );
}


// ============================================================
// GENERATED ASSET LISTS
// ============================================================

export const SLEEP_STORY_ILLUSTRATIONS =
  buildAssetList(storyModules);

export const SLEEP_SOUND_ILLUSTRATIONS =
  buildAssetList(soundModules);


// ============================================================
// STABLE HASH
//
// We do NOT use Math.random().
//
// If React re-renders the page, the same track keeps the
// same illustration instead of changing every render.
// ============================================================

function hashString(value = "") {
  const text = String(value);

  let hash = 2166136261;

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    hash ^= text.charCodeAt(index);

    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return hash >>> 0;
}


// ============================================================
// TRACK KEY
//
// Prefer slug/id because these should be unique.
// Title is used as a fallback.
// ============================================================

function getTrackKey(
  track,
  type = ""
) {
  const uniqueTrackValue =
    track?.slug ||
    track?.id ||
    track?.title ||
    "default";

  return `${type}|${uniqueTrackValue}`;
}


// ============================================================
// SELECT ARTWORK
// ============================================================

function selectArtwork(
  track,
  artworkList,
  type
) {
  if (
    !Array.isArray(artworkList) ||
    artworkList.length === 0
  ) {
    return "";
  }

  const trackKey =
    getTrackKey(
      track,
      type
    );

  const hash =
    hashString(trackKey);

  const artworkIndex =
    hash % artworkList.length;

  return (
    artworkList[artworkIndex]?.src ||
    artworkList[0]?.src ||
    ""
  );
}


// ============================================================
// STORY ARTWORK
// ============================================================

export function getSleepStoryIllustration(
  track
) {
  return selectArtwork(
    track,
    SLEEP_STORY_ILLUSTRATIONS,
    "story"
  );
}


// ============================================================
// SOUND ARTWORK
// ============================================================

export function getSleepSoundIllustration(
  track
) {
  return selectArtwork(
    track,
    SLEEP_SOUND_ILLUSTRATIONS,
    "sound"
  );
}


// ============================================================
// GENERIC TRACK ARTWORK
// ============================================================

export function getSleepTrackIllustration(
  track,
  trackType
) {
  if (trackType === "stories") {
    return getSleepStoryIllustration(
      track
    );
  }

  if (trackType === "sounds") {
    return getSleepSoundIllustration(
      track
    );
  }

  return "";
}