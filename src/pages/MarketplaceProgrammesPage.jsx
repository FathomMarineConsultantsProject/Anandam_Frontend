import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, Search, X } from "lucide-react";
import { getPublishedResortEvent, listPublishedResortEvents } from "../api/resortEventsPublicApi";
import { getStoredUser } from "../utils/storage";
import resortHostArtwork from "../assets/marketplace/programmes-resort-figma.png";
import "../styles/marketplaceProgrammes.css";

// Reuses the marketplace carousel asset already supplied for the Families page.
// The original source file is named "Property 1=progtams.png" in that bundle.
const backgrounds = import.meta.glob(
  "../assets/marketplace/main page illustrations/*.{png,jpg,jpeg,webp}",
  { eager: true, query: "?url", import: "default" }
);
const byName = Object.fromEntries(
  Object.entries(backgrounds).map(([key, value]) => [key.split("/").pop().toLowerCase(), value])
);
const programmeHero = byName["property 1=progtams.png"] || byName["property 1=programmes.png"] || null;

const FILTERS = [
  "All", "Near me", "Weekend getaways", "Staycations", "Family retreats",
  "Sign-off retreats", "Yoga and meditation", "Ayurveda and detox",
  "Nature and adventure", "Festivals and seasons", "Online programmes",
];

function text(value) { return String(value ?? ""); }
function eventSearchText(event) {
  return [event.name, event.shortDescription, event.venue, event.property?.name,
    event.property?.city, event.property?.country, event.listingType].map(text).join(" ").toLowerCase();
}
function matchingFilter(event, category, localCity) {
  const haystack = eventSearchText(event);
  switch (category) {
    case "All": return true;
    case "Near me": return Boolean(localCity) && text(event.property?.city).toLowerCase().includes(localCity.toLowerCase());
    case "Weekend getaways": return /weekend|week end|two.day|2.day/.test(haystack);
    case "Staycations": return /staycation|city break|local getaway/.test(haystack);
    case "Family retreats": return /family|families|children|kids/.test(haystack);
    case "Sign-off retreats": return /sign.off|shore leave|seafarer|crew/.test(haystack);
    case "Yoga and meditation": return /yoga|meditation|mindful/.test(haystack);
    case "Ayurveda and detox": return /ayurved|detox/.test(haystack);
    case "Nature and adventure": return /nature|adventure|forest|mountain|hike|trek|waterfall/.test(haystack);
    case "Festivals and seasons": return /festival|seasonal|season|celebration/.test(haystack);
    case "Online programmes": return /online|virtual|remote|video/.test(haystack);
    default: return true;
  }
}
function money(price, currency, pricingType) {
  if (pricingType === "FREE") return "Free";
  if (price === null || price === undefined || price === "") return "Price on request";
  const value = Number(price);
  if (!Number.isFinite(value)) return "Price on request";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: currency || "INR", maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency || "INR"} ${value.toLocaleString("en-IN")}`;
  }
}
function pricingSuffix(type) {
  if (type === "PER_PERSON") return "/ Person";
  if (type === "PER_PACKAGE") return "/ Package";
  return "";
}
function readableDate(occurrence) {
  if (!occurrence?.startAt) return "Dates to be announced";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric", month: "short", year: "numeric", timeZone: occurrence.timeZone || "UTC",
    }).format(new Date(occurrence.startAt));
  } catch { return "Upcoming"; }
}
function place(event) {
  return [event?.property?.city, event?.property?.stateRegion].filter(Boolean).join(", ") || event?.venue || "Location to be confirmed";
}

function EventDetails({ event, loading, error, onClose, onOpenResort }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fm-prog-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="fm-prog-modal" role="dialog" aria-modal="true" aria-label="Retreat or event details">
        <button type="button" className="fm-prog-modal-close" onClick={onClose} aria-label="Close event details"><X size={20}/></button>
        {loading ? <p className="fm-prog-status">Loading event details…</p> : error ? <p className="fm-prog-error">{error}</p> : event ? <>
          {event.images?.[0]?.url ? <img className="fm-prog-modal-cover" src={event.images[0].url} alt={event.name || "Retreat"} /> : null}
          <div className="fm-prog-modal-content">
            <p className="fm-prog-eyebrow">{event.property?.name || "Published resort"}</p>
            <h2>{event.name}</h2>
            <p className="fm-prog-modal-location"><MapPin size={16}/>{place(event)}</p>
            <p>{event.shortDescription}</p>
            <p className="fm-prog-modal-price"><strong>{money(event.price, event.currency, event.pricingType)}</strong> {pricingSuffix(event.pricingType)}</p>
            {event.occurrences?.length ? <div className="fm-prog-modal-section"><h3>Available sessions</h3>
              {event.occurrences.map((o) => <p key={o.id}><CalendarDays size={16}/>{readableDate(o)}</p>)}
            </div> : null}
            {event.whatsIncluded ? <div className="fm-prog-modal-section"><h3>What's included</h3><p>{event.whatsIncluded}</p></div> : null}
            {event.whatToBring ? <div className="fm-prog-modal-section"><h3>What to bring</h3><p>{event.whatToBring}</p></div> : null}
            {event.cancellationPolicy ? <div className="fm-prog-modal-section"><h3>Cancellation policy</h3><p>{event.cancellationPolicy}</p></div> : null}
            {event.property?.slug ? <button type="button" className="fm-prog-primary-button" onClick={onOpenResort}>View hosting resort</button> : null}
          </div>
        </> : null}
      </section>
    </div>
  );
}

export default function MarketplaceProgrammesPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [queryInput, setQueryInput] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [guests, setGuests] = useState(1);
  const [filter, setFilter] = useState("All");
  const [city, setCity] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const slides = programmeHero ? [programmeHero] : [];

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setEvents([]);
    listPublishedResortEvents({ page: 1, limit: 30, search, date, type })
      .then((data) => { if (!active) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((e) => { if (active) setError(e?.data?.message || e?.message || "Unable to load events."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, date, type, retry]);

  const filtered = useMemo(() => events.filter((event) =>
    matchingFilter(event, filter, city) &&
    (!event.maxParticipants || Number(event.maxParticipants) >= guests)
  ), [events, filter, city, guests]);

  async function loadMore() {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const data = await listPublishedResortEvents({ page: pagination.page + 1, limit: 30, search, date, type });
      setEvents((old) => [...old, ...(data.events || []).filter((e) => !old.some((previous) => previous.id === e.id))]);
      setPagination(data.pagination || pagination);
    } catch (e) { setError(e?.data?.message || e?.message || "Unable to load more events."); }
    finally { setLoadingMore(false); }
  }

  async function openDetails(id) {
    setDetail(null);
    setDetailError("");
    setDialogOpen(true);
    setDetailLoading(true);
    try { const data = await getPublishedResortEvent(id); setDetail(data.event || null); }
    catch (e) { setDetailError(e?.data?.message || e?.message || "Unable to load event details."); }
    finally { setDetailLoading(false); }
  }
  function closeDetails() { setDialogOpen(false); setDetail(null); }

  return (
    <section className="fm-programmes" aria-label="Programmes and events">
      <form className="fm-prog-search" onSubmit={(e) => { e.preventDefault(); setSearch(queryInput.trim()); }}>
        <label className="fm-prog-search-field"><span>Where</span>
          <input aria-label="Search programmes by location, title, or resort" placeholder="Where are you going?" value={queryInput} onChange={(e) => setQueryInput(e.target.value)} />
        </label>
        <label className="fm-prog-search-field"><span>When</span>
          <input type="date" aria-label="Choose event date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="fm-prog-search-field"><span>Stay type</span>
          <select aria-label="Programme type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Resort, ashram, retreat</option><option value="EVENT">Event</option>
            <option value="DAY_PROGRAMME">Day programme</option><option value="MULTI_DAY_RETREAT">Multi-day retreat</option>
          </select>
        </label>
        <label className="fm-prog-search-field fm-prog-search-field--who"><span>Who</span>
          <select aria-label="Number of participants" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n === 1 ? "Just me" : `${n} guests`}</option>)}
          </select>
        </label>
        <button className="fm-prog-search-button" type="submit" aria-label="Search programmes"><Search size={22}/></button>
      </form>

      <div className="fm-prog-hero">
        {slides.length ? <img src={slides[heroIndex]} alt="Peaceful wellness retreat illustration" /> : <div className="fm-prog-hero-fallback">Explore wellness retreats and events</div>}
        {slides.length > 1 ? <><div className="fm-prog-hero-dots">
          {slides.map((_, i) => <button aria-label={`Slide ${i + 1}`} type="button" className={i === heroIndex ? "active" : ""} key={i} onClick={() => setHeroIndex(i)}/>)}</div>
          <div className="fm-prog-hero-arrows"><button type="button" aria-label="Previous slide" onClick={() => setHeroIndex((heroIndex + slides.length - 1) % slides.length)}><ChevronLeft size={17}/></button>
            <button type="button" aria-label="Next slide" onClick={() => setHeroIndex((heroIndex + 1) % slides.length)}><ChevronRight size={17}/></button></div></> : null}
      </div>

      <div className="fm-prog-intro"><h2>Get Away For A Weekend, Or Stay Close To Home</h2>
        <p>Weekend Getaways, Staycations In Your Own City, Sign-Off Retreats And Family Trips At Resorts, Ashrams And Homestays.</p>
      </div>

      <nav className="fm-prog-tags" aria-label="Filter retreats and events">
        {FILTERS.map((category) => <button key={category} type="button" className={category === filter ? "active" : ""}
          aria-pressed={category === filter} onClick={() => setFilter(category)}>{category}</button>)}
      </nav>
      {filter === "Near me" ? <label className="fm-prog-city-filter">Enter your city to see local events
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, e.g. Mumbai" />
      </label> : null}

      <div className="fm-prog-section-head"><h2>All Retreats And Events</h2><p>Explore Upcoming Retreats, Weekend Getaways, And Staycations.</p></div>
      {error ? <div className="fm-prog-error" role="alert">{error} <button type="button" onClick={() => setRetry((v) => v + 1)}>Try again</button></div> : null}
      {loading ? <p className="fm-prog-status">Loading published events…</p> : filtered.length === 0 ?
        <p className="fm-prog-status">No published upcoming events match these filters.</p> :
        <div className="fm-prog-grid">{filtered.map((event) => {
          const saved = favourites.includes(event.id);
          return <article key={event.id} className="fm-prog-card">
            <div className="fm-prog-card-media">
              <button type="button" className="fm-prog-open" aria-label={`Open ${event.name}`} onClick={() => openDetails(event.id)}>
                {event.coverUrl ? <img loading="lazy" src={event.coverUrl} alt={event.name || "Retreat event"} />
                  : <span className="fm-prog-no-photo">Photo coming soon</span>}
              </button>
              <button type="button" className={`fm-prog-heart ${saved ? "is-saved" : ""}`} aria-label={saved ? "Remove from saved events for this visit" : "Save event for this visit"}
                aria-pressed={saved} onClick={() => setFavourites((all) => saved ? all.filter((id) => id !== event.id) : [...all, event.id])}>
                <Heart size={17} fill={saved ? "currentColor" : "none"}/>
              </button>
            </div>
            <button type="button" className="fm-prog-card-title" onClick={() => openDetails(event.id)}>{event.name || "Retreat or event"}</button>
            <div className="fm-prog-card-location"><MapPin size={14}/><span>{place(event)}</span></div>
            <div className="fm-prog-card-date"><CalendarDays size={13}/><span>{readableDate(event.nextOccurrence)}</span></div>
            <div className="fm-prog-card-cost"><strong>{money(event.price, event.currency, event.pricingType)}</strong><span>{pricingSuffix(event.pricingType)}</span></div>
          </article>;
        })}</div>}
      {!loading && pagination.page < pagination.totalPages ? <button type="button" disabled={loadingMore} className="fm-prog-load-more" onClick={loadMore}>
        {loadingMore ? "Loading…" : "Load more events"}</button> : null}

      <div className="fm-prog-host-cta">
        <div className="fm-prog-cta-visual" aria-hidden="true"><img src={resortHostArtwork} alt="" /></div>
        <div><h2>Run a resort, ashram or retreat centre?</h2>
          <p>Welcome seafarer families. Manage your property and publish your retreats on Anandam.</p>
          <div className="fm-prog-host-actions"><button type="button" onClick={() => navigate(getStoredUser()?.role === "RESORT_OWNER" ? "/app/my-property" : "/signup")}>Host with ANANDUM</button>
            <button type="button" onClick={() => navigate("/signup")}>Invite a place you love</button></div>
        </div>
      </div>
      {dialogOpen ? <EventDetails event={detail} loading={detailLoading} error={detailError} onClose={closeDetails}
        onOpenResort={() => { const slug = detail?.property?.slug; closeDetails(); if (slug) navigate(`/marketplace/resorts/${encodeURIComponent(slug)}`); }} /> : null}
    </section>
  );
}
