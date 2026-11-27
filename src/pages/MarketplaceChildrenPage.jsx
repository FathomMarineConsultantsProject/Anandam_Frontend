import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, Search, X } from "lucide-react";
import { getPublishedResortEvent, listPublishedResortEvents } from "../api/resortEventsPublicApi";
import "../styles/marketplaceChildren.css";

// Use the Children's illustration already stored with the Marketplace
// main-page artwork. No extra asset package or image library is required.
const localArtwork = import.meta.glob(
  "../assets/marketplace/main page illustrations/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" }
);
const heroSlides = Object.entries(localArtwork)
  .filter(([path]) => /child|kids|abode/i.test(path))
  .map(([, source]) => source);

const GROUPS = [
  { key: "4-7", title: "Picked For Ages 4–7" },
  { key: "8-12", title: "Picked For Ages 8–12" },
  { key: "13-17", title: "Picked For Ages 13–17" },
];
function includesGroup(event, group) {
  const d = event.childrenDetails;
  if (!d) return false;
  if (d.ageGroups?.includes(group)) return true;
  if (!d.ageGroups?.includes("OTHER") || d.minimumAge == null || d.maximumAge == null) return false;
  const [min, max] = group.split("-").map(Number);
  return d.minimumAge <= max && d.maximumAge >= min;
}
function formattedPrice(event) {
  if (event.pricingType === "FREE") return "Free";
  if (event.price == null) return "Price on request";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: event.currency || "INR", maximumFractionDigits: 0 }).format(Number(event.price)); }
  catch { return `${event.currency || "INR"} ${event.price}`; }
}
function formattedDate(occ) {
  if (!occ?.startAt) return "Dates coming soon";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: occ.timeZone || "Asia/Kolkata" }).format(new Date(occ.startAt));
}
const place = (event) => [event?.property?.city, event?.property?.stateRegion].filter(Boolean).join(", ") || event?.venue || "Location available soon";
const guardianLabel = (policy) => ({
  REQUIRED_TO_STAY: "A parent or guardian must stay",
  WELCOME_TO_STAY: "A parent or guardian may stay",
  DROP_OFF_PICK_UP: "Drop-off and pick-up available",
}[policy] || "Guardian policy to be confirmed");

function Details({ event, onClose }) {
  const navigate = useNavigate();
  useEffect(() => {
    const listener = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);
  if (!event) return null;
  const cover = event.images?.find((i) => i.kind === "COVER") || event.images?.[0];
  return <div className="mc-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
    <article className="mc-modal" role="dialog" aria-modal="true" aria-label="Children's event details">
      <button type="button" className="mc-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
      {cover?.url && <img className="mc-modal-cover" src={cover.url} alt={event.name || "Children's event"} />}
      <div className="mc-modal-content">
        <span className="mc-event-label">Children's event or retreat</span><h2>{event.name}</h2>
        <p className="mc-location"><MapPin size={14} /> {place(event)}</p><p>{event.shortDescription}</p>
        <h3>Suitable ages</h3><p>{(event.childrenDetails?.ageGroups || []).map((g) => g === "OTHER" ? `${event.childrenDetails?.minimumAge ?? "?"}–${event.childrenDetails?.maximumAge ?? "?"}` : g).join(", ")} years</p>
        <h3>Parents and guardians</h3><p>{guardianLabel(event.childrenDetails?.guardianPolicy)}</p>
        {event.childrenDetails?.guardianInstructions && <p>{event.childrenDetails.guardianInstructions}</p>}
        <h3>Schedule</h3>{(event.occurrences || []).map((occ) => <p key={occ.id}><CalendarDays size={15}/> {formattedDate(occ)} · {occ.schedule}</p>)}
        <h3>Price</h3><p><strong>{formattedPrice(event)}</strong> {event.pricingType === "PER_PERSON" ? "per child" : event.pricingType === "PER_PACKAGE" ? "per package" : ""}</p>
        {event.whatsIncluded && <><h3>What's included</h3><p>{event.whatsIncluded}</p></>}
        {event.cancellationPolicy && <><h3>Cancellation policy</h3><p>{event.cancellationPolicy}</p></>}
        {event.property?.slug && <button type="button" className="mc-primary" onClick={() => navigate(`/marketplace/resorts/${event.property.slug}`)}>View hosting resort</button>}
      </div>
    </article>
  </div>;
}

export default function MarketplaceChildrenPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("4-7");
  const [hero, setHero] = useState(0);
  const [favourites, setFavourites] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const payload = await listPublishedResortEvents({ children: "true", page: 1, limit: 50, search });
      setEvents(payload.events || []); setPagination(payload.pagination || { page: 1, totalPages: 1 });
    } catch (e) { setError(e?.data?.message || e.message || "Unable to load children's events."); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (heroSlides.length < 2) return undefined;
    const timer = setInterval(() => setHero((v) => (v + 1) % heroSlides.length), 6500);
    return () => clearInterval(timer);
  }, []);
  async function more() {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const result = await listPublishedResortEvents({ children: "true", page: pagination.page + 1, limit: 50, search });
      setEvents((old) => [...old, ...(result.events || []).filter((event) => !old.some((prev) => prev.id === event.id))]);
      setPagination(result.pagination || pagination);
    } catch (e) { setError(e?.data?.message || e.message || "Unable to load more events."); }
    finally { setLoadingMore(false); }
  }
  async function openDetail(id) {
    setDetail({ loading: true }); setDetailLoading(true); setDetailError("");
    try { const result = await getPublishedResortEvent(id); setDetail(result.event || null); }
    catch (e) { setDetailError(e?.data?.message || e.message || "Unable to open event details."); setDetail(null); }
    finally { setDetailLoading(false); }
  }
  const byAge = useMemo(() => Object.fromEntries(GROUPS.map((group) =>
    [group.key, events.filter((event) => includesGroup(event, group.key))])), [events]);
  const other = useMemo(() => events.filter((event) => event.childrenDetails?.ageGroups?.includes("OTHER")
    && !GROUPS.some((g) => includesGroup(event, g.key))), [events]);
  const sections = [...GROUPS, ...(other.length ? [{ key: "OTHER", title: "More Ages & Activities" }] : [])];
  const sectionCards = (rows) => <div className="mc-grid">{rows.map((event) => {
    const saved = favourites.includes(event.id);
    return <article key={event.id} className="mc-card"><button type="button" className="mc-picture" onClick={() => openDetail(event.id)} aria-label={`View ${event.name}`}>
      {event.coverUrl ? <img src={event.coverUrl} loading="lazy" alt={event.name || "Children's activity"} /> : <span>Photo coming soon</span>}</button>
      <button type="button" className={`mc-heart ${saved ? "is-saved" : ""}`} aria-label={saved ? "Remove saved event" : "Save event"} aria-pressed={saved}
        onClick={() => setFavourites((old) => saved ? old.filter((id) => id !== event.id) : [...old, event.id])}><Heart size={15} fill={saved ? "currentColor" : "none"}/></button>
      <div className="mc-name-row"><button type="button" onClick={() => openDetail(event.id)}>{event.name || "Children's activity"}</button></div>
      <p className="mc-card-copy">{event.shortDescription || "A thoughtful activity for children."}</p>
      <p className="mc-card-place"><MapPin size={12} /> {place(event)}</p>
      <div className="mc-card-bottom"><strong>{formattedPrice(event)}</strong><span>{event.pricingType === "PER_PERSON" ? "/ Child" : event.pricingType === "PER_PACKAGE" ? "/ Package" : ""}</span></div>
    </article>;
  })}</div>;

  return <div className="mc-page">
    <form className="mc-search" onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }}>
      <label><strong>Where</strong><input aria-label="Search location or children's activity" placeholder="Where are you going?" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}/></label>
      <label><strong>When</strong><span>Upcoming sessions</span></label>
      <label><strong>Stay type</strong><span>Children's events & retreats</span></label>
      <label><strong>Who</strong><span>Children and family</span></label>
      <button type="submit" aria-label="Search children's events"><Search size={20}/></button>
    </form>
    <div className="mc-hero">
      {heroSlides.length ? <img src={heroSlides[hero]} alt="Children's wellbeing activities" />
        : <div className="mc-hero-fallback"><h2>Thoughtful experiences for children</h2><p>Discover upcoming activities from published Anandam hosts.</p></div>}
      {heroSlides.length > 1 ? <><div className="mc-hero-dots">{heroSlides.map((_, i) => <button key={i} type="button" className={hero === i ? "active" : ""} onClick={() => setHero(i)} aria-label={`Show illustration ${i + 1}`}/>)}</div>
        <div className="mc-hero-arrows"><button type="button" aria-label="Previous image" onClick={() => setHero((hero - 1 + heroSlides.length) % heroSlides.length)}><ChevronLeft size={17}/></button><button type="button" aria-label="Next image" onClick={() => setHero((hero + 1) % heroSlides.length)}><ChevronRight size={17}/></button></div></> : null}
    </div>
    <div className="mc-intro"><h2>For The Children Who Wait At Home</h2><p>Counselling, calm and play for seafarers' children aged 4 to 17, so the months apart feel a little shorter on both sides of the ocean.</p></div>
    <div className="mc-age-tabs">{GROUPS.map((group) => <button type="button" className={group.key === ageFilter ? "active" : ""} key={group.key} onClick={() => { setAgeFilter(group.key); document.getElementById(`mc-${group.key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{group.key === "4-7" ? "Ages 4–7" : group.key === "8-12" ? "Ages 8–12" : "Ages 13–17"}</button>)}</div>
    {error && <div className="mc-error" role="alert">{error} <button type="button" onClick={load}>Try again</button></div>}
    {loading ? <p className="mc-state">Loading published children's events…</p> : sections.map((group) => <section className="mc-list-section" id={`mc-${group.key}`} key={group.key}>
      <h2>{group.title}</h2><p>Play-based support with a parent or guardian in every session where required.</p>
      {group.key === "OTHER" ? sectionCards(other) : byAge[group.key]?.length ? sectionCards(byAge[group.key]) : <p className="mc-state mc-empty">No upcoming published events for this age group yet.</p>}
    </section>)}
    {!loading && pagination.page < pagination.totalPages ? <div className="mc-more"><button type="button" disabled={loadingMore} onClick={more}>{loadingMore ? "Loading…" : "Load more children's events"}</button></div> : null}
    {detail?.id && <Details event={detail} onClose={() => setDetail(null)} />}
    {detailLoading && <div className="mc-backdrop"><div className="mc-loading">Loading event details…</div></div>}
    {detailError && <div className="mc-error" role="alert">{detailError} <button type="button" onClick={() => setDetailError("")}>Dismiss</button></div>}
  </div>;
}
