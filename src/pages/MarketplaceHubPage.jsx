import { useSearchParams } from "react-router-dom";
import MarketplaceEntryPage from "./MarketplaceEntryPage";
import MarketplaceFamiliesPage from "./MarketplaceFamiliesPage";
import "../styles/marketplaceFamilies.css";

const TABS = [
  ["care", "Care"],
  ["programmes", "Programmes"],
  ["families", "Families"],
  ["experiences", "Experiences"],
  ["children", "Children & Abode"],
  ["gifts", "Gifts"],
  ["community", "Community"],
];

export default function MarketplaceHubPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([value]) => value === params.get("tab"))
    ? params.get("tab") : "families";
  const changeTab = (next) => {
    const updated = new URLSearchParams(params);
    updated.set("tab", next);
    setParams(updated);
  };

  return (
    <div className="fm-marketplace-shell">
      <header className="fm-marketplace-header">
        <h1>Marketplace</h1>
        <p>Explore wellness stays and find practitioners who support your wellbeing</p>
      </header>
      <nav className="fm-primary-tabs" aria-label="Marketplace sections">
        {TABS.map(([value, label]) => (
          <button type="button" key={value} className={tab === value ? "active" : ""}
            onClick={() => changeTab(value)} aria-current={tab === value ? "page" : undefined}>
            {label}
          </button>
        ))}
      </nav>
      {tab === "care" ? (
        // Keep existing practitioner marketplace implementation completely intact.
        <MarketplaceEntryPage />
      ) : tab === "families" ? (
        <MarketplaceFamiliesPage />
      ) : (
        <section className="fm-unavailable"><h2>{TABS.find(([value]) => value === tab)?.[1]}</h2>
          <p>This marketplace section is coming soon.</p></section>
      )}
    </div>
  );
}
