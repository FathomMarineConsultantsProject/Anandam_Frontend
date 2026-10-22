import dateIcon from "../../assets/marketplace/date_range.svg";

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r=".8" fill="currentColor" />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3.8v3.4M16 3.8v3.4M4.5 9h15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m9.2 14.1 1.8 1.8 3.8-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const items = [
  { key: "new", label: "New enquiries", tone: "blue" },
  { key: "awaiting", label: "Awaiting your response", tone: "peach" },
  { key: "upcoming", label: "Upcoming appointments", tone: "lavender" },
];

export default function PractitionerStats({ counts = {} }) {
  return (
    <div className="pr-stats-grid">
      {items.map((item) => (
        <div className="pr-stat-card" key={item.key}>
          <div className={`pr-stat-icon pr-stat-icon-${item.tone}`}>
            {item.key === "new" && <img src={dateIcon} alt="" aria-hidden="true" />}
            {item.key === "awaiting" && <AlertIcon />}
            {item.key === "upcoming" && <CalendarCheckIcon />}
          </div>
          <span>{item.label}</span>
          <strong>{counts[item.key] ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}
