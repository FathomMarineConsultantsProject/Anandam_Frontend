import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, BedDouble, Users, CheckCircle2, ImageOff } from "lucide-react";
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

export default function ResortPublicDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
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
      <h1>{property.name || "Wellness property"} {property.resortRating && <span className="fm-detail-rating">★ {property.resortRating}</span>}</h1>
      <div className="fm-detail-meta"><span><MapPin size={16} /> {[property.city, property.stateRegion, property.country].filter(Boolean).join(", ")}</span>{website && <a href={website} target="_blank" rel="noopener noreferrer">Visit website <ExternalLink size={14}/></a>}</div>
      <section id="fm-overview" className="fm-detail-section"><h2>Overview</h2><p className="fm-description">{property.description || "No description provided yet."}</p></section>
      <section id="fm-amenities" className="fm-detail-section"><h2>What this place offers</h2>{property.amenities?.length ? <div className="fm-amenities">{property.amenities.map((item) => <span key={item}><CheckCircle2 size={15} /> {item}</span>)}</div> : <p>Property amenities have not been added yet.</p>}</section>
      <section id="fm-rooms" className="fm-detail-section"><h2>Rooms</h2><p>Browse room types and their indicative nightly prices. Online reservations are not available yet.</p>
        <div className="fm-rooms-list">{(property.rooms || []).map((room) => {
          const photo = room.images?.[0]?.url;
          return <article className="fm-room-row" key={room.id}><div className="fm-room-image">{photo ? <img src={photo} alt={room.name} /> : <BedDouble size={34}/>}</div>
            <div className="fm-room-text"><h3>{room.name}</h3><p>{room.description || "Comfortable accommodation at this property."}</p>
              <div className="fm-room-meta"><span><Users size={15}/> Up to {room.maxAdults || 0} adults{room.maxChildren ? ` + ${room.maxChildren} children` : ""}</span>
                <span><BedDouble size={15}/> {(room.beds || []).map((bed) => `${bed.quantity} ${bed.bedType}`).join(", ") || "Beds: enquire"}</span></div>
              {(room.features || []).length > 0 && <p className="fm-room-features">{room.features.join(" · ")}</p>}
              {(room.includedMeals || []).length > 0 && <p className="fm-included">Included: {room.includedMeals.join(", ")}</p>}
            </div><div className="fm-room-price"><strong>{money(room.basePrice, room.currency)}</strong><span>/ night</span><small>{room.quantity} room(s) of this type</small></div>
          </article>;
        })}{!property.rooms?.length && <div className="fm-state">No rooms have been listed yet.</div>}</div>
      </section>
      <section id="fm-location" className="fm-detail-section"><h2>Where you'll be</h2><p><MapPin size={17} /> {[property.addressLine1, property.addressLine2, property.city, property.stateRegion, property.postalCode, property.country].filter(Boolean).join(", ")}</p>
        {mapUrl && <a className="fm-map-link" href={mapUrl} target="_blank" rel="noopener noreferrer">Open location in Google Maps <ExternalLink size={16}/></a>}
      </section>
      <section className="fm-detail-section"><h2>House rules</h2><div className="fm-rule-grid"><p><strong>Smoking</strong><span>{property.smokingPolicy || "Not specified"}</span></p><p><strong>Pets</strong><span>{property.petsPolicy || "Not specified"}</span></p><p><strong>Alcohol</strong><span>{property.alcoholPolicy || "Not specified"}</span></p></div>{property.additionalRules && <p className="fm-description">{property.additionalRules}</p>}</section>
    </div>}
    {activeImage && <div className="fm-lightbox" role="presentation" onClick={() => setActiveImage(null)}><button type="button" aria-label="Close photo" onClick={() => setActiveImage(null)}>×</button><img src={activeImage} alt="Expanded resort" /></div>}
  </main>;
}
