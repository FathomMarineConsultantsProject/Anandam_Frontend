import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, MapPin, Search, ShieldCheck, CalendarCheck2, Users, BadgeCheck, Building2 } from "lucide-react";
import { listPublishedResorts } from "../api/resortMarketplaceApi";
import "../styles/marketplaceFamilies.css";

// Exact assets provided by the designer; preserve their filenames.
// Vite resolves these files inside the existing frontend repository.
const illustrationModules = import.meta.glob(
  "../assets/marketplace/main page illustrations/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" }
);
const illustrationByName = Object.fromEntries(
  Object.entries(illustrationModules).map(([path, url]) => [path.split("/").pop().toLowerCase(), url])
);
const heroSlides = [
  ["Property 1=Families.png", "Families"],
  ["Property 1=care.png", "Care"],
  ["Property 1=progtams.png", "Programmes"],
  ["Property 1=Experiences.png", "Experiences"],
  ["Property 1=Children & Abode.png", "Children & Abode"],
].map(([filename, label]) => ({ url: illustrationByName[filename.toLowerCase()], label }))
 .filter((slide) => Boolean(slide.url));

const hostIllustrationModules = import.meta.glob(
  "../assets/marketplace/resortslogin/Modern forest retreat diorama-5 1.png",
  { eager: true, query: "?url", import: "default" }
);
const hostIllustration = Object.values(hostIllustrationModules)[0] || null;

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

// Editorial preview content only. Replace with authenticated guest reviews when
// the review API is available; these are NOT verified customer testimonials.
const FAMILY_MOMENTS = [
  { name: "Priya Nair", place: "Kovalam, Kerala", text: "After weeks apart, we finally had time for long walks, good food and unhurried conversations by the sea." },
  { name: "Ananya Mehta", place: "Coorg, Karnataka", text: "A quiet mountain getaway gave us the space to reconnect, explore nature and enjoy a few peaceful days together." },
  { name: "Rohan Iyer", place: "Rishikesh, Uttarakhand", text: "Morning yoga, fresh air and evenings together made the trip a lovely break from our usual routine." },
  { name: "Neha Sharma", place: "Munnar, Kerala", text: "We spent our days among tea gardens and our evenings catching up. It felt wonderful to be together again." },
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
  const slides = heroSlides;

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
        <div className="fm-search-field"><span>When</span><span className="fm-muted-input">Add dates</span></div>
        <div className="fm-search-field"><span>Stay type</span><select aria-label="Stay type" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All stays">Resort, ashram, retreat</option>
          <option value="Wellness resorts">Wellness resorts</option>
          <option value="Ashrams">Ashrams</option>
          <option value="Ayurveda">Ayurveda</option>
          <option value="Yoga retreats">Yoga retreats</option>
          <option value="Meditation & silence">Meditation retreats</option>
        </select></div>
        <div className="fm-search-field"><span>Who</span><span className="fm-muted-input">Add guests</span></div>
        <button className="fm-search-submit" type="submit" aria-label="Search stays"><Search size={19} /></button>
      </form>
    </div>

    <div className="fm-hero" aria-label="Anandam marketplace illustrations">
      {slides.length ? slides.map((slide, index) => <img key={slide.label} src={slide.url}
        alt={`${slide.label} illustration for Anandam marketplace`} className={index === hero % slides.length ? "active" : ""} />)
        : <div className="fm-hero-missing">Place your marketplace illustrations in the main page illustrations folder.</div>}
      {slides.length > 1 && <>
        <div className="fm-hero-dots" aria-label="Select illustration">{slides.map((slide,index) => <button key={slide.label}
          className={index === hero % slides.length ? "active" : ""} type="button" aria-label={`Show ${slide.label} illustration`}
          onClick={() => setHero(index)} />)}</div>
        <div className="fm-hero-controls"><button type="button" aria-label="Previous image" onClick={() => setHero((hero + slides.length - 1) % slides.length)}><ArrowLeft size={18} /></button>
          <button type="button" aria-label="Next image" onClick={() => setHero((hero + 1) % slides.length)}><ArrowRight size={18} /></button></div>
      </>}
    </div>

    <div className="fm-section-intro"><div className="fm-hero-pills"><span>While they're at sea</span><span>Together after sign-off</span></div><h2>Rest, Restore and Reconnect While They Are at Sea</h2>
      <p>Discover wellness resorts, ashrams and retreats for seafarer families.</p></div>
    <div className="fm-filter-scroll" aria-label="Stay categories">{FILTERS.map((item) => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    {error && <div className="fm-error" role="alert">{error} <button type="button" onClick={() => setRetryCount((n) => n + 1)}>Retry</button></div>}
    {loading ? <div className="fm-state">Loading wellness stays…</div> : <>
      {primary.length > 0 && <section className="fm-list-section"><h2>{category === "All stays" ? "Wellness Resorts Families Love" : category}</h2><p>Explore real published listings from Anandam hosts.</p>{cards(primary)}</section>}
      {secondary.length > 0 && <section className="fm-list-section"><h2>Ashrams And Spiritual Programmes</h2><p>Quiet stays and thoughtful retreats.</p>{cards(secondary)}</section>}
      {other.length > 0 && <section className="fm-list-section"><h2>More Places To Explore</h2><p>Discover other stays on Anandam.</p>{cards(other)}</section>}
      {!filtered.length && <div className="fm-state"><h3>No stays found</h3><p>Try another category or search. Only published resorts appear here.</p></div>}
      {pagination.page < pagination.totalPages && <div className="fm-more"><button type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more properties"}</button></div>}
    </>}

    <section className="fm-list-section fm-reviews"><h2>Moments From Seafarer Families</h2><p>Stories of reconnecting, finding calm and spending meaningful time together.</p>
      <div className="fm-review-grid">{FAMILY_MOMENTS.map((review, index) => <article key={index}><div className="fm-review-stars" aria-hidden="true">★★★★★</div><p>“{review.text}”</p><strong>{review.name}</strong><span>{review.place}</span></article>)}</div>
      <p className="fm-review-disclosure">Illustrative family stories. Guest-submitted reviews will be displayed here when available.</p>
    </section>
    <div className="fm-benefits"><div className="fm-benefits-feature"><span>Homecoming retreats</span><h2>Coming home after months at sea is its own journey</h2><p>Explore places where families can reconnect and spend time together.</p></div>
      <div className="fm-benefit-grid"><div><ShieldCheck/><strong>Thoughtful stays</strong><p>Explore amenities and house rules before you enquire.</p></div><div><CalendarCheck2/><strong>Plan your break</strong><p>Booking and live availability are coming soon.</p></div><div><Users/><strong>Family-friendly options</strong><p>Find hosts who describe experiences for families.</p></div><div><BadgeCheck/><strong>Published hosts</strong><p>Listings shown here have been published on Anandam.</p></div></div></div>
    <section className="fm-host-banner"><div className="fm-host-graphic">{hostIllustration ? <img src={hostIllustration} alt="Forest retreat with cottages and trees" /> : <Building2 size={75} />}</div><div className="fm-host-content"><h2>Run a resort, ashram or retreat centre?</h2><p>Welcome seafarer families. Free to list, one commission only when a stay is completed.</p><div className="fm-host-actions"><button type="button" onClick={() => navigate("/signup")}>Host with ANANDUM</button><a className="fm-host-invite" href="mailto:?subject=List%20your%20retreat%20on%20Anandum&body=I%20thought%20you%20might%20be%20interested%20in%20hosting%20your%20retreat%20on%20Anandum.">Invite a place you love</a></div></div></section>
  </div>;
}
