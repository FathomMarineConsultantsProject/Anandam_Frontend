import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, BedDouble, Users, ImageOff,
  AirVent, BriefcaseBusiness, Usb, WashingMachine, Wifi,
  UtensilsCrossed, Trees, BookOpen, Sofa, Flower2, Mountain, Accessibility,
  ShieldCheck, Camera, Siren, Flame, Tv, ConciergeBell, Waves,
  CircleParking, LockKeyhole, Building2, HeartPulse, Star,
  Dumbbell, Sparkles, ShowerHead, Coffee, CarFront, Baby, PawPrint,
  Sun, Leaf, Fan, Bath, UsersRound, Flower, Landmark, HandHeart } from "lucide-react";
import { getPublishedResort } from "../api/resortMarketplaceApi";
import "../styles/marketplaceFamilies.css";

function money(value, currency = "INR") {
  if (value == null) return "Price on request";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value)); }
  catch { return `${currency} ${value}`; }
}
function safeExternalUrl(value) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}

// The backend stores stable machine-readable keys. Keep them unchanged in data;
// format only the labels and icons displayed to guests.
function IronIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 10h8.3a4 4 0 0 1 3.7 2.7l2 5.3H3l2.3-6.5A2.2 2.2 0 0 1 7 10Z" />
      <path d="M8 10V7h7v3M4 20h17" />
      <path d="M11 13h3" />
    </svg>
  );
}
function DryCleaningIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 5a2 2 0 1 1 3 1.73c-.7.48-1.05.9-1.05 1.8v1.3" />
      <path d="m12 10 8 6.5a1.5 1.5 0 0 1-.95 2.65H4.95A1.5 1.5 0 0 1 4 16.5L12 10Z" />
    </svg>
  );
}
function HairDryerIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 8.5A3.5 3.5 0 0 1 7 5h7.5v8H7a3.5 3.5 0 0 1-3.5-4.5Z" />
      <path d="M14.5 6.5 20 5.5v7l-5.5-1M8 13l2 7h3l-1.2-7M19 8h2M19 11h2" />
    </svg>
  );
}

const AMENITY_ICONS = {
  WIFI: Wifi,
  WI_FI: Wifi,
  INTERNET: Wifi,
  AIR_CONDITIONING: AirVent,
  AC: AirVent,
  HEATING: Sun,
  FAN: Fan,
  HOUSEKEEPING: Sparkles,
  DAILY_HOUSEKEEPING: Sparkles,
  RESTAURANT: UtensilsCrossed,
  DINING: UtensilsCrossed,
  GARDEN: Trees,
  LIBRARY: BookOpen,
  RELAXATION_LOUNGE: Sofa,
  LOUNGE: Sofa,
  OUTDOOR_SPACE: Sun,
  YOGA_STUDIO: Flower2,
  YOGA: Flower2,
  MEDITATION_SPACE: Flower2,
  MEDITATION: Flower2,
  MOUNTAIN_SETTING: Mountain,
  FOREST_SETTING: Trees,
  BEACHFRONT: Waves,
  BEACH_ACCESS: Waves,
  SEA_VIEW: Waves,
  STEP_FREE_ENTRANCE: Accessibility,
  WHEELCHAIR_ACCESS: Accessibility,
  WHEELCHAIR_ACCESSIBLE: Accessibility,
  ACCESSIBILITY: Accessibility,
  LIFT_ACCESS: Building2,
  ELEVATOR: Building2,
  ON_SITE_SECURITY: ShieldCheck,
  SECURITY: ShieldCheck,
  CCTV: Camera,
  IN_ROOM_SAFE: LockKeyhole,
  SAFE: LockKeyhole,
  SMOKE_ALARMS: Siren,
  SMOKE_DETECTOR: Siren,
  FIRST_AID_KIT: HeartPulse,
  FIRST_AID: HeartPulse,
  FIRE_EXTINGUISHERS: Flame,
  FIRE_SAFETY: Flame,
  BUSINESS_CENTER: BriefcaseBusiness,
  BUSINESS_CENTRE: BriefcaseBusiness,
  CLOTHING_IRON: IronIcon,
  IRON: IronIcon,
  DATA_PORTS: Usb,
  USB_PORTS: Usb,
  DRY_CLEANING: DryCleaningIcon,
  LAUNDRY: WashingMachine,
  HAIR_DRYER: HairDryerIcon,
  MEETING_ROOMS: UsersRound,
  CONFERENCE_ROOM: UsersRound,
  OUTDOOR_POOL: Waves,
  SWIMMING_POOL: Waves,
  INDOOR_POOL: Waves,
  POOL: Waves,
  PARKING_GARAGE: CircleParking,
  PARKING: CircleParking,
  FREE_PARKING: CircleParking,
  ROOM_SERVICE: ConciergeBell,
  TV_IN_ROOM: Tv,
  TV: Tv,
  SPA: Flower2,
  WELLNESS_CENTER: HandHeart,
  WELLNESS_CENTRE: HandHeart,
  FITNESS_CENTER: Dumbbell,
  FITNESS_CENTRE: Dumbbell,
  GYM: Dumbbell,
  HOT_WATER: ShowerHead,
  PRIVATE_BATHROOM: Bath,
  CAFE: Coffee,
  COFFEE_SHOP: Coffee,
  AIRPORT_TRANSFER: CarFront,
  CHILD_FRIENDLY: Baby,
  KIDS_PLAY_AREA: Baby,
  PET_FRIENDLY: PawPrint,
  TERRACE: Sun,
  ORGANIC_FOOD: Leaf,
  AYURVEDA: Flower,
  ASHRAM: Landmark,
};
const AMENITY_LABELS = {
  WIFI: "Wi-Fi",
  WI_FI: "Wi-Fi",
  CCTV: "CCTV",
  USB_PORTS: "USB Ports",
  AC: "Air Conditioning",
  TV: "Television",
  TV_IN_ROOM: "TV in Room",
  ON_SITE_SECURITY: "On-site Security",
  IN_ROOM_SAFE: "In-room Safe",
  STEP_FREE_ENTRANCE: "Step-free Entrance",
  LIFT_ACCESS: "Lift Access",
  FIRST_AID_KIT: "First Aid Kit",
  BUSINESS_CENTER: "Business Centre",
  BUSINESS_CENTRE: "Business Centre",
  DATA_PORTS: "Data Ports",
  SMOKE_ALARMS: "Smoke Alarms",
};
function amenityKey(value) {
  return String(value ?? "").trim().replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_").replace(/_+/g, "_").toUpperCase();
}
function amenityLabel(value) {
  const key = amenityKey(value);
  if (AMENITY_LABELS[key]) return AMENITY_LABELS[key];
  return key.toLowerCase().split("_").filter(Boolean)
    .map((part) => ({wifi: "Wi-Fi", cctv: "CCTV", tv: "TV", usb: "USB", ac: "AC", bbq: "BBQ"}[part] || part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}
function AmenityPill({ name }) {
  const key = amenityKey(name);
  const Icon = AMENITY_ICONS[key] || Sparkles;
  return (
    <span className="fm-amenity-pill" data-amenity={key}>
      <Icon className="fm-amenity-icon" size={24} strokeWidth={1.9} aria-hidden="true" />
      <span className="fm-amenity-label">{amenityLabel(name)}</span>
    </span>
  );
}

// Figma groups amenity cards into horizontal rows of five on desktop.
// The rows become a fluid grid on tablet and mobile.
function AmenityList({ amenities }) {
  const rows = [];
  for (let index = 0; index < amenities.length; index += 5) {
    rows.push(amenities.slice(index, index + 5));
  }
  return (
    <div className="fm-amenities">
      {rows.map((row, rowIndex) => (
        <div className="fm-amenity-row" key={`amenity-row-${rowIndex}`}>
          {row.map((item, itemIndex) => (
            <AmenityPill key={`${amenityKey(item)}-${rowIndex * 5 + itemIndex}`} name={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ResortPublicDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [roomFilter, setRoomFilter] = useState("all");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  useEffect(() => {
    let mounted = true;
    setLoading(true); setError("");
    getPublishedResort(slug).then((result) => { if (mounted) setProperty(result?.property || null); })
      .catch((err) => { if (mounted) setError(err?.data?.message || err?.message || "Unable to load property."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);
  const photos = useMemo(() => {
    if (!property) return [];
    const cover = property.images?.filter((img) => img.kind === "COVER") || [];
    const other = property.images?.filter((img) => img.kind === "PROPERTY") || [];
    return [...cover, ...other];
  }, [property]);
  const website = safeExternalUrl(property?.websiteUrl);
  const mapUrl = safeExternalUrl(property?.googleMapsUrl);

  return <main className="fm-detail-page"><button type="button" className="fm-back" onClick={() => navigate("/marketplace?tab=families")}><ArrowLeft size={17} /> Back to Families</button>
    {loading ? <div className="fm-state">Loading property…</div> : error || !property ? <div className="fm-state fm-error">{error || "Property not found."}</div> : <div className="fm-detail-surface">
      <div className="fm-photo-grid">
        {photos.length ? <>
          <button type="button" className="fm-photo-main" onClick={() => setActiveImage(photos[0].url)}><img src={photos[0].url} alt={`${property.name} exterior`} /></button>
          <div className="fm-photo-side">{photos.slice(1, 3).map((item) => <button type="button" key={item.id} onClick={() => setActiveImage(item.url)}><img src={item.url} alt={`${property.name} property photo`} /></button>)}
            {photos.length === 1 && <div className="fm-photo-placeholder"><ImageOff size={28}/><span>More photos coming soon</span></div>}</div>
        </> : <div className="fm-photo-placeholder fm-no-photos"><ImageOff size={32}/><span>Property photos not uploaded yet</span></div>}
      </div>
      <div className="fm-detail-jump"><a href="#fm-overview">Overview</a><a href="#fm-amenities">Amenities</a><a href="#fm-rooms">Rooms</a><a href="#fm-location">Location</a></div>
      <h1>{property.name || "Wellness property"}{property.resortRating != null && property.resortRating !== "" && (
        <span className="fm-detail-rating" aria-label={`Rating ${property.resortRating} out of 5`}>
          <Star className="fm-rating-star" size={23} fill="#FFBA4C" stroke="#FFBA4C" aria-hidden="true" />
          <span className="fm-rating-number">{property.resortRating}</span>
        </span>
      )}</h1>
      <div className="fm-detail-meta"><span><MapPin size={16} /> {[property.city, property.stateRegion, property.country].filter(Boolean).join(", ")}</span>{website && <a href={website} target="_blank" rel="noopener noreferrer">Visit website <ExternalLink size={14}/></a>}</div>
      <section id="fm-overview" className="fm-detail-section"><h2>Overview</h2><p className="fm-description">{property.description || "No description provided yet."}</p></section>
      <section id="fm-amenities" className="fm-detail-section"><h2>What this place offers</h2>{property.amenities?.length ? <AmenityList amenities={property.amenities} /> : <p>Property amenities have not been added yet.</p>}</section>
      <section id="fm-rooms" className="fm-detail-section"><h2>Rooms</h2>
        <div className="fm-room-search" aria-label="Room preferences">
          <label><strong>Rooms</strong><select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}><option value="all">Select rooms</option>{(property.rooms || []).map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label>
          <label><strong>Dates</strong><span className="fm-date-pair"><input type="date" aria-label="Check-in date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /><input type="date" aria-label="Check-out date" min={checkIn || undefined} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></span></label>
          <label><strong>Guests</strong><select value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>{Array.from({length: 10}, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1} {i ? "Guests" : "Guest"}</option>)}</select></label>
        </div>
        <div className="fm-rooms-list">{(property.rooms || []).filter(room => roomFilter === "all" || room.id === roomFilter).map((room) => {
          const photo = room.images?.[0]?.url;
          return <article className="fm-room-row" key={room.id}><div className="fm-room-image">{photo ? <img src={photo} alt={room.name} /> : <BedDouble size={34}/>}</div>
            <div className="fm-room-text"><h3>{room.name}</h3><p>{room.description || "Comfortable accommodation at this property."}</p>
              <div className="fm-room-meta"><span><Users size={15}/> Up to {room.maxAdults || 0} adults{room.maxChildren ? ` + ${room.maxChildren} children` : ""}</span>
                <span><BedDouble size={15}/> {(room.beds || []).map((bed) => `${bed.quantity} ${bed.bedType}`).join(", ") || "Beds: enquire"}</span></div>
              {(room.features || []).length > 0 && <p className="fm-room-features">{room.features.map(amenityLabel).join(" · ")}</p>}
              {(room.includedMeals || []).length > 0 && <p className="fm-included">Included: {room.includedMeals.map(amenityLabel).join(", ")}</p>}
            </div><div className="fm-room-price"><button type="button" className="fm-room-select" onClick={() => setRoomFilter(room.id)}>Select</button><div className="fm-room-price-bottom"><small>{room.quantity} {room.quantity === 1 ? "Room" : "Rooms"} | Up to {room.maxAdults || 2} Adults</small><strong>{money(room.basePrice, room.currency)}</strong><span>per night</span></div></div>
          </article>;
        })}{!property.rooms?.length && <div className="fm-state">No rooms have been listed yet.</div>}</div>
      </section>
      <section id="fm-location" className="fm-detail-section"><h2>Where you’ll be</h2>
        {mapUrl && <div className="fm-map-panel"><iframe title={`Map of ${property.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent([property.addressLine1, property.city, property.stateRegion, property.country].filter(Boolean).join(', '))}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>}
        <h3 className="fm-location-heading">{[property.city, property.stateRegion, property.country].filter(Boolean).join(", ")}</h3>
        <p className="fm-location-address"><MapPin size={17} /> {[property.addressLine1, property.addressLine2, property.city, property.stateRegion, property.postalCode, property.country].filter(Boolean).join(", ")}</p>
        {mapUrl && <a className="fm-map-link" href={mapUrl} target="_blank" rel="noopener noreferrer">Show on map <ExternalLink size={16}/></a>}
      </section>
      <section className="fm-detail-section"><h2>House rules</h2><div className="fm-rule-grid"><p><strong>Smoking</strong><span>{property.smokingPolicy || "Not specified"}</span></p><p><strong>Pets</strong><span>{property.petsPolicy || "Not specified"}</span></p><p><strong>Alcohol</strong><span>{property.alcoholPolicy || "Not specified"}</span></p></div>{property.additionalRules && <p className="fm-description">{property.additionalRules}</p>}</section>
    </div>}
    {activeImage && <div className="fm-lightbox" role="presentation" onClick={() => setActiveImage(null)}><button type="button" aria-label="Close photo" onClick={() => setActiveImage(null)}>×</button><img src={activeImage} alt="Expanded resort" /></div>}
  </main>;
}
