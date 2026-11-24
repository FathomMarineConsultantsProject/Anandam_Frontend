import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, MapPin, Search, ShieldCheck, CalendarCheck2, Users, BadgeCheck, Building2 } from "lucide-react";
import { listPublishedResorts } from "../api/resortMarketplaceApi";
import "../styles/marketplaceFamilies.css";

// Vite imports local resort images that already exist in the frontend project.
const localImageModules = import.meta.glob("../assets/marketplace/resortslogin/*.{png,jpg,jpeg,webp}", {
  eager: true, query: "?url", import: "default",
});
const localImages = Object.entries(localImageModules).map(([path, url]) => ({ path, url }));
const heroImages = localImages.filter(({ path }) => /loginloadscreen[12]/i.test(path)).map(({ url }) => url);
const fallbackImages = localImages.filter(({ path }) => !/pattern|icon/i.test(path)).map(({ url }) => url);

const FILTERS = ["All stays", "Wellness resorts", "Ashrams", "Ayurveda", "Yoga retreats", "Meditation & silence", "Great for kids", "Couples reconnect", "Forest & mountains", "By the sea"];

function lower(text) { return String(text || "").toLowerCase(); }
function searchable(property) {
  return lower([property.name, property.description, property.propertyType, property.city, property.country].join(" "));
}
function categoryMatch(property, category) {
  const type = lower(property.propertyType);
  const body = searchable(property);
  switch (category) {
    case "Wellness resorts": return /resort|wellness|spa/.test(type);
    case "Ashrams": return /ashram|spiritual/.test(body);
    case "Ayurveda": return /ayurved/.test(body);
    case "Yoga retreats": return /yoga/.test(body);
    case "Meditation & silence": return /meditation|silence|meditat/.test(body);
    case "Great for kids": return /famil|kids|children|child/.test(body);
    case "Couples reconnect": return /couple|romantic|reconnect/.test(body);
    case "Forest & mountains": return /forest|mountain|nature|hill/.test(body);
    case "By the sea": return /beach|sea|coast|ocean|waterfront/.test(body);
    default: return true;
  }
}
function money(amount, currency = "INR") {
  if (amount === undefined || amount === null || amount === "") return "Contact for price";
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Contact for price";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${value.toLocaleString("en-IN")}`; }
}
function coverOf(property) {
  return property.images?.find((img) => img.kind === "COVER")?.url || property.images?.[0]?.url || null;
}
function priceOf(property) {
  return (property.rooms || []).filter((room) => room.basePrice != null)
    .sort((a, b) => Number(a.basePrice) - Number(b.basePrice))[0] || null;
}

const SAMPLE_REVIEWS = [
  { name: "Sample guest story", place: "Example retreat", text: "A peaceful stay where our family could reconnect after time apart." },
  { name: "Sample guest story", place: "Example wellness stay", text: "The quiet surroundings helped us slow down and spend time together." },
  { name: "Sample guest story", place: "Example resort", text: "A refreshing break with room to relax, explore and recharge." },
];

export default function MarketplaceFamiliesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [category, setCategory] = useState("All stays");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [hero, setHero] = useState(0);
  const [favourites, setFavourites] = useState([]);
  const slides = heroImages.length ? heroImages : fallbackImages.slice(0, 3);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProperties([]);
    listPublishedResorts({ page: 1, limit: 50, search })
      .then((data) => { if (!active) return; setProperties(data?.properties || []); setPagination(data?.pagination || { page: 1, totalPages: 1, total: 0 }); })
      .catch((err) => { if (active) setError(err?.data?.message || err?.message || "Unable to load resorts."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, retryCount]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = setInterval(() => setHero((current) => (current + 1) % slides.length), 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  async function loadMore() {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true); setError("");
    try {
      const data = await listPublishedResorts({ page: pagination.page + 1, limit: 50, search });
      setProperties((old) => [...old, ...(data?.properties || []).filter((p) => !old.some((existing) => existing.id === p.id))]);
      setPagination(data?.pagination || pagination);
    } catch (err) { setError(err?.data?.message || err?.message || "Unable to load more stays."); }
    finally { setLoadingMore(false); }
  }

  const filtered = useMemo(() => properties.filter((property) => categoryMatch(property, category)), [properties, category]);
  const wellness = filtered.filter((property) => /resort|wellness|spa|nature/i.test(property.propertyType || ""));
  const spiritual = filtered.filter((property) => /ashram|spiritual|meditation|yoga|ayurved/i.test(searchable(property)));
  const primary = category === "All stays" ? wellness : filtered;
  const secondary = category === "All stays" ? spiritual.filter((p) => !primary.some((q) => q.id === p.id)) : [];
  const other = category === "All stays" ? filtered.filter((p) => !primary.some((q) => q.id === p.id) && !secondary.some((q) => q.id === p.id)) : [];

  function cards(items) {
    return <div className="fm-card-grid">{items.map((property) => {
      const room = priceOf(property);
      const image = coverOf(property);
      const saved = favourites.includes(property.id);
      return <article className="fm-property-card" key={property.id}>
        <div className="fm-card-image-wrap" role="button" tabIndex={0} onClick={() => navigate(`/marketplace/resorts/${property.slug}`)}
          onKeyDown={(e) => { if (e.key === "Enter") navigate(`/marketplace/resorts/${property.slug}`); }}>
          {image ? <img src={image} alt={property.name || "Wellness property"} loading="lazy" /> : <div className="fm-image-fallback"><Building2 size={34} /><span>Photo coming soon</span></div>}
          <button type="button" className={`fm-heart ${saved ? "active" : ""}`} aria-label={saved ? "Remove favourite" : "Save favourite"}
            onClick={(e) => { e.stopPropagation(); setFavourites((all) => saved ? all.filter((id) => id !== property.id) : [...all, property.id]); }}>
            <Heart size={17} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="fm-card-copy"><span className="fm-type">{property.propertyType || "Wellness stay"}</span>
          <div className="fm-card-line"><h3>{property.name || "Unnamed property"}</h3>{property.resortRating ? <span className="fm-stars">★ {property.resortRating}</span> : null}</div>
          <p><MapPin size={13} /> {[property.city, property.country].filter(Boolean).join(", ") || "Location available soon"}</p>
          <div className="fm-card-footer"><div><strong>{room ? money(room.basePrice, room.currency) : "Price on request"}</strong>{room ? <span> / night</span> : null}</div>
            <button type="button" onClick={() => navigate(`/marketplace/resorts/${property.slug}`)}>View details</button></div>
        </div>
      </article>;
    })}</div>;
  }

  return <div className="fm-families">
    <div className="fm-search-bar">
      <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}>
        <label><span>Where</span><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Where are you going?" aria-label="Search destination or property" /></label>
        <label><span>When</span><span className="fm-muted-input">Dates coming soon</span></label>
        <label><span>Stay type</span><span className="fm-muted-input">Resort, ashram, retreat</span></label>
        <label><span>Who</span><span className="fm-muted-input">Guests at booking</span></label>
        <button className="fm-search-submit" type="submit" aria-label="Search stays"><Search size={19} /></button>
      </form>
    </div>

    <div className="fm-hero">
      {slides.map((src, index) => <img key={src} src={src} alt="Wellness retreat scenery" className={index === hero ? "active" : ""} />)}
      <div className="fm-hero-gradient" />
      <div className="fm-hero-content"><span>ANANDAM · FAMILY WELLNESS</span><h2>Rest, restore and reconnect</h2><p>Discover retreats for meaningful time together.</p></div>
      {slides.length > 1 && <div className="fm-hero-controls"><button aria-label="Previous image" onClick={() => setHero((hero + slides.length - 1) % slides.length)}><ArrowLeft size={18} /></button><button aria-label="Next image" onClick={() => setHero((hero + 1) % slides.length)}><ArrowRight size={18} /></button></div>}
    </div>

    <div className="fm-section-intro"><div className="fm-hero-pills"><span>While they're at sea</span><span>Together after sign-off</span></div><h2>Rest, Restore And Reconnect While They Are At Sea</h2>
      <p>Wellness resorts, ashrams and retreats chosen for seafarer families.</p></div>
    <div className="fm-filter-scroll" aria-label="Stay categories">{FILTERS.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {error && <div className="fm-error" role="alert">{error} <button type="button" onClick={() => setRetryCount((n) => n + 1)}>Retry</button></div>}
    {loading ? <div className="fm-state">Loading wellness stays…</div> : <>
      {primary.length > 0 && <section className="fm-list-section"><h2>{category === "All stays" ? "Wellness Resorts Families Love" : category}</h2><p>Explore real published listings from Anandam hosts.</p>{cards(primary)}</section>}
      {secondary.length > 0 && <section className="fm-list-section"><h2>Ashrams And Spiritual Programmes</h2><p>Quiet stays and thoughtful retreats.</p>{cards(secondary)}</section>}
      {other.length > 0 && <section className="fm-list-section"><h2>More Places To Explore</h2><p>Discover other stays on Anandam.</p>{cards(other)}</section>}
      {!filtered.length && <div className="fm-state"><h3>No stays found</h3><p>Try another category or search. Only published resorts appear here.</p></div>}
      {pagination.page < pagination.totalPages && <div className="fm-more"><button type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more properties"}</button></div>}
    </>}

    <section className="fm-list-section fm-reviews"><h2>Moments From Seafarer Families</h2><p>Sample stories for layout preview. Verified guest reviews will be connected later.</p>
      <div className="fm-review-grid">{SAMPLE_REVIEWS.map((review, index) => <article key={index}><div className="fm-review-stars">★★★★★</div><p>“{review.text}”</p><strong>{review.name}</strong><span>{review.place}</span><small>Demo content</small></article>)}</div>
    </section>
    <div className="fm-benefits"><div className="fm-benefits-feature"><span>Homecoming retreats</span><h2>Coming home after months at sea is its own journey</h2><p>Explore places where families can reconnect and spend time together.</p></div>
      <div className="fm-benefit-grid"><div><ShieldCheck/><strong>Thoughtful stays</strong><p>Explore amenities and house rules before you enquire.</p></div><div><CalendarCheck2/><strong>Plan your break</strong><p>Booking and live availability are coming soon.</p></div><div><Users/><strong>Family-friendly options</strong><p>Find hosts who describe experiences for families.</p></div><div><BadgeCheck/><strong>Published hosts</strong><p>Listings shown here have been published on Anandam.</p></div></div></div>
    <section className="fm-host-banner"><div className="fm-host-graphic"><Building2 size={75} /></div><div><h2>Run a resort, ashram or retreat centre?</h2><p>Introduce your property to seafarer families. Create your host profile and list your stay.</p><div className="fm-host-actions"><button type="button" onClick={() => navigate("/signup")}>Host with ANANDAM</button></div></div></section>
  </div>;
}
