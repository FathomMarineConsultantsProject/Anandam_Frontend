const tabs = [
  ["new", "New enquiries"],
  ["upcoming", "Upcoming sessions"],
  ["reschedule", "Reschedule requested"],
  ["history", "History"],
];

export default function PractitionerTabs({ active, counts = {}, onChange }) {
  return (
    <div className="pr-tabs" role="tablist" aria-label="Session filters">
      {tabs.map(([key, label]) => (
        <button
          type="button"
          key={key}
          role="tab"
          aria-selected={active === key}
          className={active === key ? "active" : ""}
          onClick={() => onChange?.(key)}
        >
          {label}
          {key !== "history" && counts[key] > 0 ? ` (${counts[key]})` : ""}
        </button>
      ))}
    </div>
  );
}
