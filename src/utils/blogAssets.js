/*
  Vite automatically includes every image placed in src/assets/blogpage.

  That means when you add more preset cover illustrations later, you do NOT
  need to add another import in this file. Restart Vite after adding files if
  HMR does not pick the new file up immediately.
*/
const coverModules = import.meta.glob(
  "../assets/blogpage/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    import: "default",
  }
);

const avatarModules = import.meta.glob(
  "../assets/profile/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    import: "default",
  }
);

function baseName(path = "") {
  return String(path).split("/").pop() || "";
}

export const BLOG_ILLUSTRATIONS = Object.entries(coverModules)
  .map(([path, src]) => ({
    key: baseName(path),
    src,
    label: baseName(path)
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  }))
  .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

const COVER_MAP = new Map(
  BLOG_ILLUSTRATIONS.map((item) => [item.key, item.src])
);

export function getBlogIllustration(key) {
  if (!key) return BLOG_ILLUSTRATIONS[0]?.src || "";

  if (COVER_MAP.has(key)) {
    return COVER_MAP.get(key);
  }

  // Backward compatibility if an old DB record stored only the filename stem.
  const match = BLOG_ILLUSTRATIONS.find(
    (item) => item.key.replace(/\.[^.]+$/, "") === key
  );

  return match?.src || BLOG_ILLUSTRATIONS[0]?.src || "";
}

function avatarNumber(path = "") {
  const match = baseName(path).match(/avatar\s*(\d+)/i);
  return match ? String(Number(match[1])) : null;
}

const AVATAR_MAP = Object.entries(avatarModules).reduce((map, [path, src]) => {
  const number = avatarNumber(path);
  if (number) map[number] = src;
  return map;
}, {});

export function getProfileAvatar(author) {
  if (!author || String(author.avatarMode || "").toUpperCase() !== "AVATAR") {
    return null;
  }

  return AVATAR_MAP[String(author.avatarId)] || null;
}

export function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}
