function initials(name = "User") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export default function PractitionerAvatar({ name, src, size = "md" }) {
  return (
    <div className={`pr-avatar pr-avatar-${size}`}>
      {src ? <img src={src} alt={name || "Profile"} /> : <span>{initials(name)}</span>}
    </div>
  );
}
