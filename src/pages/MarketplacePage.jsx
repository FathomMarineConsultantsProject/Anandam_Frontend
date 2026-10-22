import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnquiries, getPractitioners } from "../api/marketplaceApi";
import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import MarketplaceIcon from "../components/marketplace/MarketplaceIcon";
import "../styles/marketplace.css";

const CATEGORIES = ["All", "Mental Health", "Counselling", "Physical Wellness", "Nutrition", "Yoga & Mindfulness"];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [practitioners, setPractitioners] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [category, setCategory] = useState("All");
  const [language, setLanguage] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [pData, eData] = await Promise.all([
          getPractitioners(),
          getMyEnquiries().catch(() => ({ enquiries: [] })),
        ]);
        if (!active) return;
        setPractitioners(pData.practitioners || []);
        setEnquiries(eData.enquiries || []);
      } catch (err) {
        if (active) setError(err?.message || "Unable to load marketplace.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const activeEnquiry = useMemo(
    () => enquiries.find((item) => ["PENDING", "TIME_PROPOSED", "RESCHEDULE_REQUESTED", "CONFIRMED"].includes(item.status)) || enquiries[0],
    [enquiries]
  );

  const languages = useMemo(
    () => Array.from(new Set(practitioners.flatMap((p) => p.languages || []))).sort(),
    [practitioners]
  );

  const locations = useMemo(
    () => Array.from(new Set(practitioners.map((p) => p.location || p.country || p.user?.homeCountry).filter(Boolean))).sort(),
    [practitioners]
  );

  const filtered = useMemo(() => practitioners.filter((p) => {
    const typeText = `${p.practitionerType || ""} ${p.professionalTitle || ""}`.toLowerCase();
    const categoryOk = category === "All" || typeText.includes(category.toLowerCase().split(" ")[0]);
    const languageOk = !language || (p.languages || []).includes(language);
    const pLocation = p.location || p.country || p.user?.homeCountry || "";
    const locationOk = !location || pLocation === location;
    return categoryOk && languageOk && locationOk;
  }), [practitioners, category, language, location]);

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading">
        <div>
          <h1>Marketplace</h1>
          <p>Explore wellness stays and find practitioners who support your wellbeing</p>
        </div>
      </header>

      <div className="mk-filter-row">
        <div className="mk-category-tabs">
          {CATEGORIES.map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <div className="mk-select-filters">
          <div className="mk-select-wrap">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Language</option>
              {languages.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="mk-select-wrap">
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Location</option>
              {locations.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>

      {activeEnquiry && (
        <EnquiryStatusCard
          enquiry={activeEnquiry}
          onOpen={() => navigate(`/marketplace/enquiries/${activeEnquiry.id}`)}
        />
      )}

      {error && <div className="mk-error-banner">{error}</div>}
      {loading ? (
        <div className="mk-loading">Loading practitioners…</div>
      ) : (
        <div className="mk-practitioner-grid">
          {filtered.map((practitioner) => (
            <PractitionerCard
              key={practitioner.id}
              practitioner={practitioner}
              onOpen={() => navigate(`/marketplace/practitioners/${practitioner.slug}`)}
            />
          ))}
          {!filtered.length && <div className="mk-empty-state">No practitioners match these filters.</div>}
        </div>
      )}
    </main>
  );
}

function PractitionerCard({ practitioner, onOpen }) {
  const name = practitioner.user?.fullName || "Practitioner";
  const specialties = (practitioner.specialties || [])
    .map((item) => item.specialty?.name || item.name)
    .filter(Boolean)
    .slice(0, 3);
  const location = practitioner.location || practitioner.country || practitioner.user?.homeCountry || "—";
  const price = practitioner.sessionPrice != null
    ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")} / session`
    : "Contact for fee";

  return (
    <article className="mk-practitioner-card">
      <div className="mk-card-head">
        <div className="mk-avatar-lg">
          {practitioner.profileImageUrl ? <img src={practitioner.profileImageUrl} alt={name} /> : name[0]}
        </div>
        <div className="mk-card-identity">
          <h2>{name}</h2>
          <p>{practitioner.professionalTitle || practitioner.practitionerType}</p>
          <div className="mk-rating"><span className="mk-stars">★★★★★</span><span className="mk-rating-value">4.5</span></div>
        </div>
      </div>

      <div className="mk-card-meta">
        <div className="mk-card-meta-item">
          <MarketplaceIcon name="location" />
          <span>Location: <strong>{location}</strong></span>
        </div>
        <div className="mk-card-meta-item">
          <MarketplaceIcon name="speak" />
          <span>Speaks: <strong>{(practitioner.languages || []).join(", ") || "—"}</strong></span>
        </div>
      </div>

      <div className="mk-expertise">
        <div className="mk-expertise-label"><MarketplaceIcon name="expertise" /><span>Expertise:</span></div>
        <div className="mk-specialty-row">
          {specialties.length
            ? specialties.map((item, index) => <span className={`mk-tag mk-tag-${index + 1}`} key={item}>{item}</span>)
            : <span className="mk-tag mk-tag-1">General wellbeing</span>}
        </div>
      </div>

      <div className="mk-card-footer">
        <strong>{price}</strong>
        <button className="mk-primary-button mk-view-profile-button" onClick={onOpen}>View profile</button>
      </div>
    </article>
  );
}
