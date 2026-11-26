import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble, Briefcase, CheckCircle2, Coffee, Droplets, Dumbbell,
  ExternalLink, Flame, Flower2, Hotel, Image as ImageIcon, LockKeyhole,
  MapPin, Pencil, Plus, Save, ShieldCheck, Sprout, Tv, Upload, Waves,
  Wifi, Wind, X, Car, Star, Trash2, Bath, Sun, Leaf, BookOpen,
  Utensils, Cctv, DoorOpen, Mountain, Check, AlertCircle,
} from "lucide-react";
import { myPropertyApi } from "../api/myPropertyApi";
import {
  RoomsPricingTab, EventsRetreatsTab, CalendarTab, GuestStaysTab,
} from "./myPropertyTabs";
import "../styles/my-properties.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms & Pricing" },
  { id: "events", label: "Events & Retreats" },
  { id: "calendar", label: "Calendar" },
  { id: "stays", label: "Guest stays" },
];

const BASIC_FIELDS = ["name", "resortRating", "websiteUrl", "propertyType", "description"];
const LOCATION_FIELDS = ["country", "addressLine1", "addressLine2", "city", "stateRegion", "postalCode", "googleMapsUrl"];
const CONTACT_FIELDS = ["contactName", "enquiryEmail", "phoneNumber"];
const RULES_FIELDS = ["smokingPolicy", "petsPolicy", "alcoholPolicy", "additionalRules"];

const AMENITY_ICONS = {
  WIFI: Wifi,
  PARKING: Car,
  AIR_CONDITIONING: Wind,
  HOUSEKEEPING: Hotel,
  LAUNDRY_SERVICE: Droplets,
  SWIMMING_POOL: Waves,
  RESTAURANT: Utensils,
  GARDEN: Flower2,
  LIBRARY: BookOpen,
  RELAXATION_LOUNGE: Coffee,
  OUTDOOR_SPACE: Sun,
  YOGA_STUDIO: Flower2,
  MEDITATION_SPACE: Leaf,
  SPA_ROOMS: Sprout,
  STEAM_ROOM: Droplets,
  PRIVATE_CONSULTATION_ROOM: Briefcase,
  BEACHFRONT: Waves,
  NEAR_BEACH: Waves,
  MOUNTAIN_SETTING: Mountain,
  FOREST_SETTING: Sprout,
  LAKESIDE: Waves,
  RIVERSIDE: Waves,
  COUNTRYSIDE: Leaf,
  CITY_SETTING: Hotel,
  STEP_FREE_ENTRANCE: DoorOpen,
  WHEELCHAIRS_AVAILABLE: CheckCircle2,
  WHEELCHAIR_ACCESSIBLE_PATHS: CheckCircle2,
  LIFT_ACCESS: CheckCircle2,
  ON_SITE_SECURITY: ShieldCheck,
  CCTV: Cctv,
  FIRE_EXTINGUISHERS: Flame,
  SMOKE_ALARMS: ShieldCheck,
  FIRST_AID_KIT: CheckCircle2,
  IN_ROOM_SAFE: LockKeyhole,
  BUSINESS_CENTER: Briefcase,
  TV_IN_ROOM: Tv,
  FITNESS_CENTRE: Dumbbell,
};

const pick = (obj, keys) => Object.fromEntries(keys.map((key) => [key, obj?.[key] ?? ""]));
const textOrDash = (value) => value === undefined || value === null || value === "" ? "—" : String(value);
const titleCase = (value) => String(value || "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const isLive = (p) => p?.status === "PUBLISHED";
export const formatPrice = (value, currency = "INR") => {
  if (value === undefined || value === null || value === "") return "Price not set";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price not set";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
};

function FormField({ label, value, onChange, type = "text", options, rows = 3, required, placeholder, min }) {
  return (
    <label className="mp-form-field">
      <span>{label}</span>
      {options ? (
        <select value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required}>
          <option value="">Select</option>
          {options.map((option) => (
            <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value}>
              {typeof option === "string" ? titleCase(option) : option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} />
      ) : (
        <input
          type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)}
          required={required} placeholder={placeholder} min={min}
        />
      )}
    </label>
  );
}

function ViewField({ label, value, children, className = "" }) {
  return (
    <div className={`mp-view-field ${className}`}>
      <div className="mp-view-field__name">{label}</div>
      <div className="mp-view-field__value">{children ?? textOrDash(value)}</div>
    </div>
  );
}

function SectionHeading({ title, onEdit, editing }) {
  return (
    <div className="mp-section-heading">
      <h2>{title}</h2>
      <button type="button" className="mp-edit-button" onClick={onEdit}>
        {editing ? <X size={17} strokeWidth={1.7} /> : <Pencil size={17} strokeWidth={1.8} />}
        <span>{editing ? "Cancel" : "Edit"}</span>
      </button>
    </div>
  );
}

function EditControls({ saving }) {
  return (
    <div className="mp-edit-controls">
      <button type="submit" disabled={saving} className="mp-primary-button">
        <Save size={16} /> {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function RoomCard({ room, onSelect }) {
  const image = Array.isArray(room.images) ? room.images[0] : null;
  const bedDetails = Array.isArray(room.beds)
    ? room.beds.map((bed) => `${bed.quantity} ${titleCase(bed.bedType)} ${bed.quantity === 1 ? "bed" : "beds"}`).join(" · ")
    : "";
  const inclusions = Array.isArray(room.includedMeals) ? room.includedMeals.map((meal) => `${titleCase(meal)} included`).join(", ") : "";
  return (
    <article className="mp-room-card">
      <div className="mp-room-photo">
        {image?.url ? <img src={image.url} alt={room.name || "Room"} loading="lazy" /> : <span className="mp-image-empty"><BedDouble size={33} />No room photo</span>}
      </div>
      <div className="mp-room-content">
        <h3>{room.name || "Untitled room"}</h3>
        <p className="mp-room-description">{room.description || "No description added."}</p>
        <p className="mp-room-beds">{bedDetails || "Bed details not provided"}</p>
        <div className="mp-room-meta-bottom">
          {inclusions ? <span className="mp-room-inclusions">{inclusions}</span> : <span className="mp-room-inclusions mp-room-inclusions--empty">&nbsp;</span>}
          <span className="mp-room-hint">{room.quantity} {room.quantity === 1 ? "Room" : "Rooms"}</span>
        </div>
      </div>
      <div className="mp-room-aside">
        <button type="button" className="mp-select-button" onClick={() => onSelect(room.id)}>Select</button>
        <div className="mp-room-aside__bottom">
          <span>{room.quantity} {room.quantity === 1 ? "Room" : "Rooms"} | {room.maxAdults} Adults, {room.maxChildren} Children</span>
          <strong>{formatPrice(room.basePrice, room.currency)}</strong>
          <small>Base price</small>
        </div>
      </div>
    </article>
  );
}

function Overview({ property, catalog, refresh, onRoomSelect }) {
  const [editing, setEditing] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setEditing(""); setForm({}); setError(""); setSuccess("");
  }, [property.id]);

  const propertyPhotos = useMemo(() => (Array.isArray(property.images) ? property.images : [])
    .filter((image) => ["PROFILE", "COVER", "PROPERTY"].includes(image.kind))
    .sort((a, b) => {
      const order = { COVER: 0, PROFILE: 1, PROPERTY: 2 };
      return (order[a.kind] ?? 2) - (order[b.kind] ?? 2) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }), [property.images]);

  function openEdit(section) {
    setError(""); setSuccess("");
    if (editing === section) { setEditing(""); return; }
    setEditing(section);
    const fields = section === "basic" ? BASIC_FIELDS : section === "location" ? LOCATION_FIELDS : section === "contact" ? CONTACT_FIELDS : section === "rules" ? RULES_FIELDS : [];
    setForm(section === "amenities" ? { amenities: [...(property.amenities ?? [])] } : pick(property, fields));
  }

  function setField(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  async function saveEdit(event) {
    event.preventDefault();
    if (!editing || editing === "photos") return;
    setError(""); setSaving(true);
    try {
      await myPropertyApi.saveSection(property.id, editing, editing === "amenities" ? { amenities: form.amenities ?? [] } : form);
      await refresh();
      setEditing(""); setSuccess("Changes saved.");
    } catch (requestError) { setError(requestError.message || "Unable to save this section."); }
    finally { setSaving(false); }
  }
  async function uploadPropertyPhotos(event) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setError(""); setSuccess(""); setSaving(true);
    try {
      for (const file of files) await myPropertyApi.uploadImage(property.id, file, "PROPERTY");
      await refresh(); setSuccess("Photos uploaded.");
    } catch (requestError) { setError(requestError.message || "Unable to upload photo."); }
    finally { event.target.value = ""; setSaving(false); }
  }
  async function removePhoto(imageId) {
    if (!window.confirm("Remove this property photo?")) return;
    setError(""); setSaving(true);
    try { await myPropertyApi.deleteImage(property.id, imageId); await refresh(); }
    catch (requestError) { setError(requestError.message || "Unable to remove photo."); }
    finally { setSaving(false); }
  }

  const amenityOptions = Object.values(catalog?.amenities ?? {}).flat();
  const allAmenityCodes = [...new Set([...amenityOptions, ...(property.amenities ?? [])])];

  return (
    <div className="mp-overview-panel">
      {(error || success) && (
        <div className={`mp-inline-message ${error ? "mp-inline-message--error" : "mp-inline-message--success"}`} role={error ? "alert" : "status"}>
          {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}{error || success}
        </div>
      )}

      <section className="mp-overview-section mp-photos-section">
        <SectionHeading title="Property Photos" editing={editing === "photos"} onEdit={() => openEdit("photos")} />
        <div className="mp-photo-gallery">
          {[0, 1, 2].map((position) => {
            const photo = propertyPhotos[position];
            return (
              <div className={`mp-photo-gallery__item mp-photo-gallery__item--${position + 1}`} key={photo?.id || position}>
                {photo?.url ? <img src={photo.url} alt={`${property.name || "Property"} photo ${position + 1}`} /> : (
                  <div className="mp-image-empty"><ImageIcon size={36} strokeWidth={1.2} /><span>No photo added</span></div>
                )}
                {editing === "photos" && photo?.id && (
                  <button className="mp-photo-remove" type="button" disabled={saving} title="Remove photo" onClick={() => removePhoto(photo.id)}><Trash2 size={15} /></button>
                )}
              </div>
            );
          })}
        </div>
        {editing === "photos" && (
          <div className="mp-photo-manager">
            <label className="mp-secondary-button mp-upload-label"><Upload size={16} />{saving ? "Uploading…" : "Add property photos"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={saving} onChange={uploadPropertyPhotos} />
            </label>
            <span>JPEG, PNG or WebP · up to 5 MB per photo</span>
            {propertyPhotos.length > 3 && <div className="mp-photo-thumbs">{propertyPhotos.slice(3).map((photo) => <div key={photo.id}><img src={photo.url} alt="Additional property" /><button type="button" disabled={saving} onClick={() => removePhoto(photo.id)}><Trash2 size={14} /></button></div>)}</div>}
          </div>
        )}
      </section>

      <section className="mp-overview-section">
        <SectionHeading title="Property details" editing={editing === "basic"} onEdit={() => openEdit("basic")} />
        {editing === "basic" ? (
          <form onSubmit={saveEdit} className="mp-edit-form mp-edit-form--grid">
            <FormField label="Resort Name" value={form.name} onChange={(v) => setField("name", v)} required />
            <FormField label="Resort Rating" type="number" min="0" value={form.resortRating} onChange={(v) => setField("resortRating", v)} />
            <FormField label="Property Type" value={form.propertyType} onChange={(v) => setField("propertyType", v)} options={catalog?.propertyTypes ?? []} />
            <FormField label="Website" type="url" value={form.websiteUrl} onChange={(v) => setField("websiteUrl", v)} placeholder="https://" />
            <div className="mp-form-field--full"><FormField label="About Your Property" value={form.description} type="textarea" rows={6} onChange={(v) => setField("description", v)} /></div>
            <EditControls saving={saving} />
          </form>
        ) : (
          <div className="mp-field-grid">
            <ViewField label="Resort Name" value={property.name} />
            <ViewField label="Resort Rating">
              {Number(property.resortRating) > 0 ? (
                <span className="mp-stars" aria-label={`${property.resortRating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} size={19} strokeWidth={1} fill={i < Math.round(Number(property.resortRating)) ? "currentColor" : "none"} />)}
                </span>
              ) : "—"}
            </ViewField>
            <ViewField label="Location" value={[property.city, property.stateRegion].filter(Boolean).join(", ") || property.country} />
            <ViewField label="Website">{property.websiteUrl ? <a className="mp-plain-link" href={property.websiteUrl} target="_blank" rel="noopener noreferrer">{property.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> : "—"}</ViewField>
            <ViewField label="Property Type"><span className="mp-type-label"><Hotel size={18} strokeWidth={1.5} />{titleCase(property.propertyType) || "—"}</span></ViewField>
            <div className="mp-grid-spacer" aria-hidden="true" />
            <ViewField className="mp-field-grid__full mp-about-field" label="About Your Property"><p>{property.description || "No description added."}</p></ViewField>
          </div>
        )}
      </section>

      <section className="mp-overview-section">
        <SectionHeading title="Address" editing={editing === "location"} onEdit={() => openEdit("location")} />
        {editing === "location" ? (
          <form onSubmit={saveEdit} className="mp-edit-form mp-edit-form--grid">
            {[
              ["Country", "country"], ["Address Line 1", "addressLine1"],
              ["Address Line 2", "addressLine2"], ["City / Town", "city"],
              ["State / Region", "stateRegion"], ["PIN / Postal Code", "postalCode"],
              ["Google Maps Link", "googleMapsUrl"],
            ].map(([label, key]) => <FormField key={key} label={label} value={form[key]} onChange={(v) => setField(key, v)} />)}
            <EditControls saving={saving} />
          </form>
        ) : (
          <div className="mp-field-grid mp-field-grid--address">
            <ViewField label="Country" value={property.country} />
            <ViewField label="Address Line 1" value={property.addressLine1} />
            <ViewField label="Address Line 2" value={property.addressLine2} />
            <ViewField label="City / Town" value={property.city} />
            <ViewField label="State / Region" value={property.stateRegion} />
            <ViewField label="PIN / Postal Code" value={property.postalCode} />
            <ViewField label="Google Maps Link">{property.googleMapsUrl ? (
              <a className="mp-map-link" href={property.googleMapsUrl} target="_blank" rel="noopener noreferrer">{property.googleMapsUrl}<ExternalLink size={13} /></a>
            ) : "—"}</ViewField>
          </div>
        )}
      </section>

      <section className="mp-overview-section">
        <SectionHeading title="What this place offers" editing={editing === "amenities"} onEdit={() => openEdit("amenities")} />
        {editing === "amenities" ? (
          <form onSubmit={saveEdit} className="mp-edit-form">
            <div className="mp-amenities mp-amenities--editing">
              {allAmenityCodes.map((code) => {
                const Icon = AMENITY_ICONS[code] ?? Check;
                const checked = (form.amenities ?? []).includes(code);
                return (
                  <label className={`mp-amenity ${checked ? "mp-amenity--checked" : ""}`} key={code}>
                    <input type="checkbox" checked={checked} onChange={(event) => setField("amenities", event.target.checked ? [...(form.amenities ?? []), code] : (form.amenities ?? []).filter((v) => v !== code))} />
                    <Icon size={18} strokeWidth={1.5} /><span>{titleCase(code)}</span>
                  </label>
                );
              })}
            </div>
            <EditControls saving={saving} />
          </form>
        ) : (
          (property.amenities ?? []).length ? (
            <div className="mp-amenities">
              {property.amenities.map((code) => {
                const Icon = AMENITY_ICONS[code] ?? CheckCircle2;
                return <div key={code} className="mp-amenity"><Icon size={18} strokeWidth={1.6} /><span>{titleCase(code)}</span></div>;
              })}
            </div>
          ) : <p className="mp-empty-copy">No amenities added yet.</p>
        )}
      </section>

      <section className="mp-overview-section">
        <SectionHeading title="Rooms" editing={false} onEdit={() => onRoomSelect(null)} />
        <div className="mp-room-list">
          {property.rooms?.length ? property.rooms.map((room) => (
            <RoomCard key={room.id} room={room} onSelect={onRoomSelect} />
          )) : <p className="mp-empty-copy">No room types added yet. Select Edit to add rooms.</p>}
        </div>
      </section>

      <section className="mp-overview-section">
        <SectionHeading title="Contact & Enquiries" editing={editing === "contact"} onEdit={() => openEdit("contact")} />
        {editing === "contact" ? (
          <form onSubmit={saveEdit} className="mp-edit-form mp-edit-form--grid">
            <FormField label="Contact Person’s Name" value={form.contactName} onChange={(v) => setField("contactName", v)} />
            <FormField label="Enquiry Email" type="email" value={form.enquiryEmail} onChange={(v) => setField("enquiryEmail", v)} />
            <FormField label="Phone Number" value={form.phoneNumber} onChange={(v) => setField("phoneNumber", v)} />
            <EditControls saving={saving} />
          </form>
        ) : (
          <div className="mp-field-grid">
            <ViewField label="Contact Person’s Name" value={property.contactName} />
            <ViewField label="Enquiry Email" value={property.enquiryEmail} />
            <ViewField label="Phone Number" value={property.phoneNumber} />
            <ViewField label="Website">{property.websiteUrl ? <a className="mp-plain-link" href={property.websiteUrl} target="_blank" rel="noopener noreferrer">{property.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a> : "—"}</ViewField>
          </div>
        )}
      </section>

      <section className="mp-overview-section mp-overview-section--last">
        <SectionHeading title="House rules" editing={editing === "rules"} onEdit={() => openEdit("rules")} />
        {editing === "rules" ? (
          <form onSubmit={saveEdit} className="mp-edit-form mp-edit-form--grid">
            <FormField label="Smoking Allowed?" value={form.smokingPolicy} options={["YES", "DESIGNATED_AREAS_ONLY", "NO"]} onChange={(v) => setField("smokingPolicy", v)} />
            <FormField label="Pets Allowed?" value={form.petsPolicy} options={["YES", "ON_REQUEST", "NO"]} onChange={(v) => setField("petsPolicy", v)} />
            <FormField label="Alcohol Allowed?" value={form.alcoholPolicy} options={["YES", "NO"]} onChange={(v) => setField("alcoholPolicy", v)} />
            <div className="mp-form-field--full"><FormField label="Additional Rules" value={form.additionalRules} type="textarea" onChange={(v) => setField("additionalRules", v)} /></div>
            <EditControls saving={saving} />
          </form>
        ) : (
          <div className="mp-field-grid">
            <ViewField label="Smoking Allowed?" value={titleCase(property.smokingPolicy)} />
            <ViewField label="Pets Allowed?" value={titleCase(property.petsPolicy)} />
            <ViewField label="Alcohol Allowed?" value={titleCase(property.alcoholPolicy)} />
            {property.additionalRules && <ViewField label="Additional Rules" value={property.additionalRules} />}
          </div>
        )}
      </section>
    </div>
  );
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [property, setProperty] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const [response, catalogResponse] = await Promise.all([
          myPropertyApi.listProperties(), myPropertyApi.getCatalog(),
        ]);
        if (cancelled) return;
        const list = Array.isArray(response?.properties) ? response.properties : [];
        setProperties(list);
        setCatalog(catalogResponse);
        const preferred = new URLSearchParams(window.location.search).get("propertyId");
        setSelectedId(list.find((p) => p.id === preferred)?.id || list[0]?.id || "");
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || "Unable to load your properties.");
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const refresh = useCallback(async () => {
    if (!selectedId) return;
    const response = await myPropertyApi.getProperty(selectedId);
    setProperty(response?.property ?? null);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) { setProperty(null); return; }
    let cancelled = false;
    setDetailLoading(true); setError(""); setProperty(null);
    myPropertyApi.getProperty(selectedId).then((result) => {
      if (!cancelled) setProperty(result?.property ?? null);
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message || "Unable to load this property.");
    }).finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  function switchTab(nextTab) { setTab(nextTab); setSelectedRoomId(null); }
  function openRoom(roomId) { setSelectedRoomId(roomId); setTab("rooms"); }
  function switchProperty(id) {
    setSelectedId(id); setTab("overview"); setSelectedRoomId(null);
    const url = new URL(window.location.href);
    url.searchParams.set("propertyId", id);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  }

  const tabProps = { property, refresh, catalog };

  return (
    <div className="mp-page">
      <div className="mp-page-top">
        <div className="mp-page-top__copy">
          <h1>My Properties</h1>
          <p>Manage your properties in one place.</p>
        </div>
        <div className="mp-page-top__right">
          {properties.length > 1 && (
            <label className="mp-property-picker">
              <span className="mp-visually-hidden">Choose property</span>
              <select value={selectedId} onChange={(event) => switchProperty(event.target.value)}>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name || "Unnamed property"}</option>)}
              </select>
            </label>
          )}
          {property && <div className={`mp-live-pill ${!isLive(property) ? "mp-live-pill--offline" : ""}`}>
            <span className="mp-live-pill__dot" />{isLive(property) ? "Live" : titleCase(property.status)}
          </div>}
        </div>
      </div>

      <div className="mp-tabs" role="tablist" aria-label="Property management sections">
        {TABS.map((item) => (
          <button key={item.id} id={`mp-tab-${item.id}`} type="button" role="tab"
            aria-selected={tab === item.id} aria-controls={`mp-panel-${item.id}`}
            className={`mp-tab${tab === item.id ? " is-active" : ""}`}
            onClick={() => switchTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      {error && <div role="alert" className="mp-error-top"><AlertCircle size={18} />{error}<button type="button" onClick={() => window.location.reload()}>Retry</button></div>}
      {loading || detailLoading ? (
        <div className="mp-empty-panel" role="status">Loading your property…</div>
      ) : !error && properties.length === 0 ? (
        <div className="mp-empty-panel"><Hotel size={35} strokeWidth={1.4} /><h2>No properties yet</h2><p>Your property will appear here after resort-owner onboarding.</p></div>
      ) : !error && property ? (
        <div id={`mp-panel-${tab}`} role="tabpanel" aria-labelledby={`mp-tab-${tab}`}>
          {tab === "overview" && <Overview {...tabProps} onRoomSelect={openRoom} />}
          {tab === "rooms" && <RoomsPricingTab {...tabProps} selectedRoomId={selectedRoomId} clearSelection={() => setSelectedRoomId(null)} />}
          {tab === "events" && <EventsRetreatsTab {...tabProps} />}
          {tab === "calendar" && <CalendarTab {...tabProps} onManageRooms={() => switchTab("rooms")} />}
          {tab === "stays" && <GuestStaysTab {...tabProps} />}
        </div>
      ) : null}
    </div>
  );
}
