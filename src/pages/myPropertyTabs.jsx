import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, BedDouble, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, Image as ImageIcon, Pencil, Plus, Save, Trash2, Upload, X,
  Users, LockKeyhole, RefreshCw,
} from "lucide-react";
import { myPropertyApi } from "../api/myPropertyApi";

const dateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const shiftDays = (date, amount) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return dateKey(d);
};
const titleCase = (text) => String(text ?? "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const money = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "") return "Price not set";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount));
  } catch { return `${currency} ${amount}`; }
};
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "—";
const options = (values) => values.map((v) => <option key={v} value={v}>{titleCase(v)}</option>);

function TabHeader({ title, description, action }) {
  return <div className="mp-tab-panel__head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}
function Message({ error, success }) {
  if (!error && !success) return null;
  return <div className={`mp-inline-message ${error ? "mp-inline-message--error" : "mp-inline-message--success"}`} role={error ? "alert" : "status"}>
    {error ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}{error || success}
  </div>;
}
function Field({ label, value, onChange, type = "text", children, required, min, rows = 4, disabled, placeholder }) {
  return <label className="mp-form-field"><span>{label}</span>
    {children ? <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}>{children}</select> : type === "textarea" ? (
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} disabled={disabled} />
    ) : (
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={required} min={min} disabled={disabled} placeholder={placeholder} />
    )}
  </label>;
}

const blankRoom = () => ({
  name: "", description: "", quantity: 1, maxAdults: 2, maxChildren: 0,
  currency: "INR", basePrice: "", beds: [{ bedType: "KING", quantity: 1 }],
  includedMeals: [], features: [],
});
const ROOM_FEATURES = ["WIFI", "AIR_CONDITIONING", "PRIVATE_BATHROOM", "BALCONY", "GARDEN_VIEW", "RIVER_VIEW", "IN_ROOM_SAFE", "TEA_COFFEE_MAKER", "OTHER"];
const MEALS = ["BREAKFAST", "LUNCH", "DINNER"];

export function RoomsPricingTab({ property, refresh, selectedRoomId, clearSelection }) {
  const [editingRoom, setEditingRoom] = useState(null);
  const [draft, setDraft] = useState(blankRoom);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unitNumbers, setUnitNumbers] = useState("");
  const [loadingUnits, setLoadingUnits] = useState(false);

  const rooms = property.rooms ?? [];
  function openRoom(room) {
    setEditingRoom(room?.id || "new");
    setError(""); setSuccess("");
    setDraft(room ? {
      name: room.name || "", description: room.description || "", quantity: room.quantity ?? 1,
      maxAdults: room.maxAdults ?? 2, maxChildren: room.maxChildren ?? 0,
      currency: room.currency || "INR", basePrice: room.basePrice ?? "",
      beds: room.beds?.length ? room.beds.map((v) => ({ bedType: v.bedType, quantity: v.quantity })) : [{ bedType: "KING", quantity: 1 }],
      includedMeals: room.includedMeals ?? [], features: room.features ?? [],
    } : blankRoom());
    if (room) {
      setLoadingUnits(true);
      myPropertyApi.listRoomUnits(property.id, room.id)
        .then((result) => setUnitNumbers((result?.units ?? []).map((u) => u.number).join(", ")))
        .catch((e) => setError(e.message || "Unable to load room numbers."))
        .finally(() => setLoadingUnits(false));
    } else setUnitNumbers("");
  }
  useEffect(() => {
    if (selectedRoomId) {
      const selected = rooms.find((r) => r.id === selectedRoomId);
      if (selected) openRoom(selected);
      clearSelection?.();
    }
    // Only respond to a new selection from Overview, not each object refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);
  useEffect(() => { setEditingRoom(null); setError(""); setSuccess(""); }, [property.id]);
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const toggle = (key, value) => setDraft((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((v) => v !== value) : [...current[key], value] }));

  async function saveRoom(event) {
    event.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    const payload = {
      ...draft,
      quantity: Number(draft.quantity), maxAdults: Number(draft.maxAdults),
      maxChildren: Number(draft.maxChildren),
      basePrice: draft.basePrice === "" ? null : String(draft.basePrice),
      beds: draft.beds.map((bed) => ({ bedType: bed.bedType.trim().toUpperCase(), quantity: Number(bed.quantity) })),
    };
    try {
      if (editingRoom === "new") await myPropertyApi.createRoom(property.id, payload);
      else await myPropertyApi.updateRoom(property.id, editingRoom, payload);
      await refresh(); setEditingRoom(null); setSuccess("Room details saved.");
    } catch (e) { setError(e.message || "Unable to save room."); }
    finally { setSaving(false); }
  }
  async function saveUnits() {
    if (!editingRoom || editingRoom === "new") return;
    const numbers = unitNumbers.split(/[,\n]+/).map((v) => v.trim()).filter(Boolean);
    setSaving(true); setError(""); setSuccess("");
    try {
      await myPropertyApi.replaceRoomUnits(property.id, editingRoom, numbers);
      await refresh(); setSuccess("Physical room numbers saved.");
    } catch (e) { setError(e.message || "Unable to save room numbers."); }
    finally { setSaving(false); }
  }
  async function uploadRoomImage(event) {
    const file = event.target.files?.[0]; if (!file || editingRoom === "new") return;
    setSaving(true); setError("");
    try { await myPropertyApi.uploadImage(property.id, file, "ROOM", editingRoom); await refresh(); setSuccess("Room photo uploaded."); }
    catch (e) { setError(e.message || "Unable to upload room photo."); }
    finally { event.target.value = ""; setSaving(false); }
  }
  async function deleteRoom(room) {
    if (!window.confirm(`Delete ${room.name}? Rooms with reservations or calendar blocks cannot be deleted.`)) return;
    setSaving(true); setError("");
    try { await myPropertyApi.deleteRoom(property.id, room.id); await refresh(); setEditingRoom(null); setSuccess("Room type removed."); }
    catch (e) { setError(e.message || "Unable to delete room."); }
    finally { setSaving(false); }
  }

  const currentRoom = rooms.find((r) => r.id === editingRoom);
  return (
    <div className="mp-tab-panel">
      <TabHeader title="Rooms & Pricing" description="Manage your room types, prices and individual room numbers." action={
        <button type="button" className="mp-primary-button" onClick={() => openRoom(null)}><Plus size={17} />Add room</button>
      } />
      <Message error={error} success={success} />
      {editingRoom ? (
        <div className="mp-surface">
          <div className="mp-section-heading"><h3>{editingRoom === "new" ? "Add a Room" : `Edit ${currentRoom?.name || "Room"}`}</h3><button type="button" className="mp-edit-button" onClick={() => setEditingRoom(null)}><X size={16} />Cancel</button></div>
          <form onSubmit={saveRoom} className="mp-edit-form mp-edit-form--grid">
            <Field label="Room name" value={draft.name} onChange={(v) => update("name", v)} required />
            <Field label="Quantity" type="number" value={draft.quantity} onChange={(v) => update("quantity", v)} required min={1} />
            <Field label="Max adults" type="number" value={draft.maxAdults} onChange={(v) => update("maxAdults", v)} required min={1} />
            <Field label="Max children" type="number" value={draft.maxChildren} onChange={(v) => update("maxChildren", v)} required min={0} />
            <Field label="Currency" value={draft.currency} onChange={(v) => update("currency", v)} required />
            <Field label="Base price" type="number" min={0} value={draft.basePrice ?? ""} onChange={(v) => update("basePrice", v)} />
            <div className="mp-form-field--full"><Field label="Description" type="textarea" value={draft.description} onChange={(v) => update("description", v)} /></div>
            <div className="mp-form-field--full">
              <strong className="mp-input-heading">Beds</strong>
              {draft.beds.map((bed, index) => <div className="mp-inline-fields" key={index}>
                <Field label="Bed type" value={bed.bedType} onChange={(v) => update("beds", draft.beds.map((row, i) => i === index ? { ...row, bedType: v } : row))} required />
                <Field label="Count" type="number" min={1} value={bed.quantity} onChange={(v) => update("beds", draft.beds.map((row, i) => i === index ? { ...row, quantity: v } : row))} required />
                <button type="button" className="mp-icon-button" title="Remove bed" disabled={draft.beds.length === 1} onClick={() => update("beds", draft.beds.filter((_, i) => i !== index))}><Trash2 size={18} /></button>
              </div>)}
              <button type="button" className="mp-text-button" onClick={() => update("beds", [...draft.beds, { bedType: "SINGLE", quantity: 1 }])}><Plus size={15} />Add bed</button>
            </div>
            <div className="mp-form-field--full"><strong className="mp-input-heading">Room features</strong><div className="mp-check-grid">
              {ROOM_FEATURES.map((v) => <label key={v}><input type="checkbox" checked={draft.features.includes(v)} onChange={() => toggle("features", v)} />{titleCase(v)}</label>)}
            </div></div>
            <div className="mp-form-field--full"><strong className="mp-input-heading">Included meals</strong><div className="mp-check-grid">
              {MEALS.map((v) => <label key={v}><input type="checkbox" checked={draft.includedMeals.includes(v)} onChange={() => toggle("includedMeals", v)} />{titleCase(v)}</label>)}
            </div></div>
            <div className="mp-form-field--full"><button type="submit" disabled={saving} className="mp-primary-button"><Save size={16} />{saving ? "Saving…" : "Save room details"}</button></div>
          </form>
          {currentRoom && <div className="mp-sub-editor">
            <div className="mp-section-heading"><h3>Room photos</h3></div>
            <div className="mp-mini-images">{(currentRoom.images ?? []).map((image) => <img key={image.id} src={image.url} alt="Room" />)}</div>
            <label className="mp-secondary-button mp-upload-label"><Upload size={16} />Add room photo<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={saving} onChange={uploadRoomImage} /></label>
            <div className="mp-section-heading mp-section-heading--gap"><h3>Physical room numbers</h3></div>
            <p className="mp-help-text">Assign actual room numbers (for example 101, 102). Used rooms cannot be removed or renamed.</p>
            <label className="mp-form-field"><span>Room numbers, separated by commas</span><textarea value={unitNumbers} rows={2} onChange={(e) => setUnitNumbers(e.target.value)} disabled={loadingUnits || saving} placeholder="101, 102, 103" /></label>
            <button type="button" disabled={saving || loadingUnits} className="mp-secondary-button" onClick={saveUnits}><Save size={15} />Save room numbers</button>
            <div className="mp-sub-editor__delete"><button type="button" className="mp-danger-button" disabled={saving} onClick={() => deleteRoom(currentRoom)}><Trash2 size={16} />Delete room type</button></div>
          </div>}
        </div>
      ) : (
        <div className="mp-surface"><div className="mp-simple-rooms">
          {rooms.length ? rooms.map((room) => <article key={room.id} className="mp-manage-row">
            <div className="mp-mini-photo">{room.images?.[0]?.url ? <img src={room.images[0].url} alt={room.name} /> : <BedDouble size={28} />}</div>
            <div className="mp-manage-row__info"><h3>{room.name}</h3><p>{room.quantity} rooms · {room.maxAdults} adults · {room.maxChildren} children</p><strong>{money(room.basePrice, room.currency)}</strong></div>
            <button className="mp-secondary-button" type="button" onClick={() => openRoom(room)}><Pencil size={16} />Edit</button>
          </article>) : <div className="mp-empty-inline"><BedDouble size={28} /><p>No room types added yet.</p></div>}
        </div></div>
      )}
    </div>
  );
}

const blankEvent = () => ({
  listingType: "EVENT", name: "", shortDescription: "", venue: "", maxParticipants: "",
  minParticipants: "", ageRequirements: "", experienceLevel: "", pricingType: "PER_PERSON",
  currency: "INR", price: "", accommodationIncluded: false, whatsIncluded: "",
  whatToBring: "", whatsNotIncluded: "", cancellationPolicy: "",
  startAt: "", endAt: "", timeZone: "Asia/Kolkata", schedule: "",
});
const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export function EventsRetreatsTab({ property }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(blankEvent);
  const [datesTouched, setDatesTouched] = useState(false);
  const [allocationsTouched, setAllocationsTouched] = useState(false);
  const [allocations, setAllocations] = useState({});

  const load = useCallback(async () => {
    const result = await myPropertyApi.listEvents(property.id);
    setEvents(result.events ?? []);
    return result.events ?? [];
  }, [property.id]);
  useEffect(() => {
    let cancelled = false; setLoading(true); setSelected(null); setError(""); setSuccess("");
    myPropertyApi.listEvents(property.id).then((result) => { if (!cancelled) setEvents(result.events ?? []); })
      .catch((e) => { if (!cancelled) setError(e.message || "Unable to load events."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [property.id]);
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  function open(event) {
    setError(""); setSuccess(""); setSelected(event);
    setDatesTouched(false); setAllocationsTouched(false);
    setDraft({ ...blankEvent(), ...event,
      maxParticipants: event.maxParticipants ?? "", minParticipants: event.minParticipants ?? "",
      price: event.price ?? "", startAt: toLocalInput(event.occurrences?.[0]?.startAt),
      endAt: toLocalInput(event.occurrences?.[0]?.endAt),
      timeZone: event.occurrences?.[0]?.timeZone || "Asia/Kolkata",
      schedule: event.occurrences?.[0]?.schedule || "",
    });
    setAllocations(Object.fromEntries((event.allocations ?? []).map((a) => [a.roomTypeId, a.quantity])));
  }
  async function createDraft() {
    setSaving(true); setError("");
    try { const response = await myPropertyApi.createEvent(property.id, {}); await load(); open(response.event); setSuccess("Draft event created. Add the details below."); }
    catch (e) { setError(e.message || "Unable to create draft."); }
    finally { setSaving(false); }
  }
  async function saveEvent(event) {
    event.preventDefault(); if (!selected) return;
    setSaving(true); setError(""); setSuccess("");
    const input = {
      listingType: draft.listingType || null,
      name: draft.name, shortDescription: draft.shortDescription, venue: draft.venue,
      maxParticipants: draft.maxParticipants === "" ? null : Number(draft.maxParticipants),
      minParticipants: draft.minParticipants === "" ? null : Number(draft.minParticipants),
      ageRequirements: draft.ageRequirements, experienceLevel: draft.experienceLevel,
      pricingType: draft.pricingType || null, currency: draft.currency,
      price: draft.pricingType === "FREE" || draft.price === "" ? null : String(draft.price),
      accommodationIncluded: draft.accommodationIncluded,
      whatsIncluded: draft.whatsIncluded, whatToBring: draft.whatToBring,
      whatsNotIncluded: draft.whatsNotIncluded, cancellationPolicy: draft.cancellationPolicy,
      ...(datesTouched ? { occurrences: draft.startAt && draft.endAt ? [{
        startAt: new Date(draft.startAt).toISOString(), endAt: new Date(draft.endAt).toISOString(),
        timeZone: draft.timeZone, schedule: draft.schedule,
      }] : [] } : {}),
      ...(allocationsTouched ? { roomAllocations: Object.entries(allocations).filter(([, qty]) => Number(qty) > 0).map(([roomTypeId, qty]) => ({ roomTypeId, quantity: Number(qty) })) } : {}),
    };
    // Never silently replace existing multiple occurrences: dates only save
    // after explicit date editor interaction, and the user is warned below.
    if (datesTouched && selected.occurrences?.length > 1 && !window.confirm("This will replace all existing dates for this event with the single schedule shown. Continue?")) { setSaving(false); return; }
    try {
      const response = await myPropertyApi.updateEvent(property.id, selected.id, input);
      await load(); open(response.event); setSuccess("Event draft saved.");
    } catch (e) { setError(e.message || "Unable to save event."); }
    finally { setSaving(false); }
  }
  async function changePublish(action) {
    setSaving(true); setError(""); setSuccess("");
    try {
      const response = action === "publish" ? await myPropertyApi.publishEvent(property.id, selected.id) : await myPropertyApi.unpublishEvent(property.id, selected.id);
      await load(); open(response.event); setSuccess(action === "publish" ? "Event published." : "Event unpublished.");
    } catch (e) { setError(e.message || "Unable to change event status."); }
    finally { setSaving(false); }
  }
  async function uploadPhoto(changeEvent) {
    const file = changeEvent.target.files?.[0]; if (!file) return;
    setSaving(true); setError("");
    try {
      await myPropertyApi.uploadEventImage(property.id, selected.id, file, "COVER");
      const data = await myPropertyApi.getEvent(property.id, selected.id);
      await load(); open(data.event); setSuccess("Event cover uploaded.");
    } catch (e) { setError(e.message || "Unable to upload cover."); }
    finally { changeEvent.target.value = ""; setSaving(false); }
  }
  async function deleteEvent() {
    if (!window.confirm(`Delete ${selected?.name || "this draft event"}? This cannot be undone.`)) return;
    setSaving(true); setError("");
    try { await myPropertyApi.deleteEvent(property.id, selected.id); await load(); setSelected(null); setSuccess("Event deleted."); }
    catch (e) { setError(e.message || "Unable to delete event."); }
    finally { setSaving(false); }
  }

  return <div className="mp-tab-panel">
    <TabHeader title="Events & Retreats" description="Create and manage events, programmes and retreats." action={
      <button type="button" className="mp-primary-button" disabled={saving} onClick={createDraft}><Plus size={16} />New event</button>
    } />
    <Message error={error} success={success} />
    {selected ? <div className="mp-surface">
      <div className="mp-section-heading"><h3>{selected.name || "Event draft"}</h3><button type="button" className="mp-edit-button" onClick={() => setSelected(null)}><X size={16} />Back to events</button></div>
      {selected.status === "PUBLISHED" && <p className="mp-help-text">This event is live. Unpublish it before editing its content.</p>}
      <form onSubmit={saveEvent} className="mp-edit-form mp-edit-form--grid">
        <Field label="Listing type" value={draft.listingType} onChange={(v) => change("listingType", v)} disabled={selected.status === "PUBLISHED"}><option value="EVENT">Event</option><option value="DAY_PROGRAMME">Day programme</option><option value="MULTI_DAY_RETREAT">Multi-day retreat</option></Field>
        <Field label="Event name" value={draft.name} onChange={(v) => change("name", v)} disabled={selected.status === "PUBLISHED"} />
        <div className="mp-form-field--full"><Field label="Short description" type="textarea" value={draft.shortDescription} onChange={(v) => change("shortDescription", v)} disabled={selected.status === "PUBLISHED"} /></div>
        <Field label="Venue" value={draft.venue} onChange={(v) => change("venue", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Maximum participants" type="number" min={1} value={draft.maxParticipants} onChange={(v) => change("maxParticipants", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Minimum participants" type="number" min={0} value={draft.minParticipants} onChange={(v) => change("minParticipants", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Experience level" value={draft.experienceLevel} onChange={(v) => change("experienceLevel", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Age requirements" value={draft.ageRequirements} onChange={(v) => change("ageRequirements", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Pricing type" value={draft.pricingType} onChange={(v) => change("pricingType", v)} disabled={selected.status === "PUBLISHED"}><option value="FREE">Free</option><option value="PER_PERSON">Per person</option><option value="PER_PACKAGE">Per package</option></Field>
        <Field label="Currency" value={draft.currency} onChange={(v) => change("currency", v)} disabled={selected.status === "PUBLISHED"} />
        <Field label="Price" type="number" min={0} value={draft.price} onChange={(v) => change("price", v)} disabled={selected.status === "PUBLISHED" || draft.pricingType === "FREE"} />
        <Field label="Accommodation included" value={draft.accommodationIncluded ? "yes" : "no"} onChange={(v) => change("accommodationIncluded", v === "yes")} disabled={selected.status === "PUBLISHED"}><option value="no">No</option><option value="yes">Yes</option></Field>
        <div className="mp-form-field--full"><Field label="What's included" type="textarea" value={draft.whatsIncluded} onChange={(v) => change("whatsIncluded", v)} disabled={selected.status === "PUBLISHED"} /></div>
        <div className="mp-form-field--full"><Field label="What to bring" type="textarea" value={draft.whatToBring} onChange={(v) => change("whatToBring", v)} disabled={selected.status === "PUBLISHED"} /></div>
        <div className="mp-form-field--full"><Field label="What's not included" type="textarea" value={draft.whatsNotIncluded} onChange={(v) => change("whatsNotIncluded", v)} disabled={selected.status === "PUBLISHED"} /></div>
        <div className="mp-form-field--full"><Field label="Cancellation policy" type="textarea" value={draft.cancellationPolicy} onChange={(v) => change("cancellationPolicy", v)} disabled={selected.status === "PUBLISHED"} /></div>
        <div className="mp-form-field--full mp-sub-editor">
          <strong className="mp-input-heading">Dates & schedule</strong>
          <p className="mp-help-text">Existing dates are preserved unless you edit these fields. Changing dates replaces the event's existing schedules.</p>
          <div className="mp-inline-fields">
            <Field label="Starts at" type="datetime-local" value={draft.startAt} disabled={selected.status === "PUBLISHED"} onChange={(v) => { change("startAt", v); setDatesTouched(true); }} />
            <Field label="Ends at" type="datetime-local" value={draft.endAt} disabled={selected.status === "PUBLISHED"} onChange={(v) => { change("endAt", v); setDatesTouched(true); }} />
          </div>
          <Field label="Time zone" value={draft.timeZone} disabled={selected.status === "PUBLISHED"} onChange={(v) => { change("timeZone", v); setDatesTouched(true); }} />
          <Field label="Schedule" type="textarea" value={draft.schedule} disabled={selected.status === "PUBLISHED"} onChange={(v) => { change("schedule", v); setDatesTouched(true); }} />
        </div>
        {draft.accommodationIncluded && <div className="mp-form-field--full mp-sub-editor"><strong className="mp-input-heading">Room allocation for retreat</strong>
          <p className="mp-help-text">Choose how many rooms of each type are reserved for attendees.</p>
          <div className="mp-inline-fields mp-inline-fields--wrap">{(property.rooms ?? []).map((room) => <Field key={room.id} label={`${room.name} (max ${room.quantity})`} type="number" min={0} value={allocations[room.id] ?? 0} disabled={selected.status === "PUBLISHED"} onChange={(v) => { setAllocations((old) => ({ ...old, [room.id]: v })); setAllocationsTouched(true); }} />)}</div>
        </div>}
        {selected.status !== "PUBLISHED" && <div className="mp-form-field--full"><button type="submit" className="mp-primary-button" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save event draft"}</button></div>}
      </form>
      <div className="mp-sub-editor"><strong className="mp-input-heading">Cover photo</strong>
        <div className="mp-mini-images">{selected.images?.filter((v) => v.kind === "COVER").map((photo) => <img key={photo.id} src={photo.url} alt="Event cover" />)}</div>
        {selected.status !== "PUBLISHED" && <label className="mp-secondary-button mp-upload-label"><Upload size={15} />Upload cover<input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={saving} /></label>}
      </div>
      <div className="mp-event-actions">
        {selected.status === "PUBLISHED" ? <button type="button" className="mp-secondary-button" disabled={saving} onClick={() => changePublish("unpublish")}>Unpublish event</button> : <button type="button" className="mp-primary-button" disabled={saving} onClick={() => changePublish("publish")}>Publish event</button>}
        {selected.status !== "PUBLISHED" && <button type="button" className="mp-danger-button" disabled={saving} onClick={deleteEvent}><Trash2 size={16} />Delete draft</button>}
      </div>
    </div> : <div className="mp-surface">
      {loading ? <p className="mp-empty-copy">Loading events…</p> : events.length ? <div className="mp-event-list">{events.map((event) => <article key={event.id} className="mp-manage-row">
        <div className="mp-mini-photo">{event.images?.[0]?.url ? <img src={event.images[0].url} alt="Event" /> : <CalendarDays size={27} />}</div>
        <div className="mp-manage-row__info"><h3>{event.name || "Untitled draft"}</h3><p>{titleCase(event.listingType || "EVENT")} · {event.occurrences?.length ? formatDate(event.occurrences[0].startAt) : "No dates added"}</p><strong>{event.pricingType === "FREE" ? "Free" : money(event.price, event.currency)}</strong></div>
        <span className={`mp-event-status ${event.status === "PUBLISHED" ? "is-published" : ""}`}>{titleCase(event.status)}</span>
        <button className="mp-secondary-button" type="button" onClick={() => open(event)}><Pencil size={15} />Manage</button>
      </article>)}</div> : <div className="mp-empty-inline"><CalendarDays size={28} /><p>No events or retreats created yet.</p></div>}
    </div>}
  </div>;
}

export function CalendarTab({ property, onManageRooms }) {
  const [start, setStart] = useState(dateKey(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [block, setBlock] = useState(null);

  const load = useCallback(async () => {
    const result = await myPropertyApi.getCalendar(property.id, { start, days: 14 });
    setData(result);
  }, [property.id, start]);
  useEffect(() => {
    let cancelled = false; setLoading(true); setError(""); setData(null); setBlock(null);
    myPropertyApi.getCalendar(property.id, { start, days: 14 }).then((result) => {
      if (!cancelled) setData(result);
    }).catch((e) => { if (!cancelled) setError(e.message || "Unable to load room calendar."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [property.id, start]);
  async function saveBlock(event) {
    event.preventDefault(); if (!block) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await myPropertyApi.blockDates(property.id, {
        roomUnitIds: [block.roomUnitId], startDate: block.startDate,
        endDate: block.endDate, reason: block.reason,
      });
      await load(); setBlock(null); setSuccess("Room dates blocked.");
    } catch (e) { setError(e.message || "Unable to block room dates."); }
    finally { setSaving(false); }
  }
  async function unblock(blockId) {
    if (!window.confirm("Remove this maintenance block?")) return;
    setSaving(true); setError(""); setSuccess("");
    try { await myPropertyApi.unblockDates(property.id, blockId); await load(); setSuccess("Room dates unblocked."); }
    catch (e) { setError(e.message || "Unable to unblock room dates."); }
    finally { setSaving(false); }
  }
  const totalUnits = data?.roomTypes?.reduce((sum, room) => sum + room.units.length, 0) ?? 0;
  return <div className="mp-tab-panel">
    <TabHeader title="Calendar" description="View room availability and block dates for maintenance or other needs." />
    <Message error={error} success={success} />
    <div className="mp-calendar-toolbar">
      <button type="button" className="mp-icon-button" title="Previous 14 days" onClick={() => setStart(shiftDays(start, -14))}><ChevronLeft size={20} /></button>
      <label className="mp-form-field"><span>Start date</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
      <button type="button" className="mp-icon-button" title="Next 14 days" onClick={() => setStart(shiftDays(start, 14))}><ChevronRight size={20} /></button>
      <div className="mp-calendar-legend"><span className="mp-legend-dot is-available" />Available <span className="mp-legend-dot is-booked" />Booked <span className="mp-legend-dot is-blocked" />Blocked</div>
    </div>
    <div className="mp-surface">
      {loading ? <p className="mp-empty-copy">Loading calendar…</p> : totalUnits === 0 ? (
        <div className="mp-empty-inline"><BedDouble size={30} /><p>No physical room numbers have been assigned yet.</p><button className="mp-primary-button" type="button" onClick={onManageRooms}>Manage room numbers</button></div>
      ) : <div className="mp-calendar-scroller"><table className="mp-calendar-table"><thead><tr><th>Room</th>{(data.dates ?? []).map((date) => <th key={date}>{new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`))}</th>)}</tr></thead><tbody>
        {(data.roomTypes ?? []).map((type) => type.units.map((unit) => <tr key={unit.id}><th scope="row"><small>{type.name}</small><strong>{unit.number}</strong></th>
          {unit.days.map((day) => <td key={day.date}><button
            className={`mp-calendar-cell is-${day.state.toLowerCase()}`} title={`${day.date}: ${day.label}`}
            type="button" disabled={saving}
            onClick={() => day.blockId ? unblock(day.blockId) : day.state === "AVAILABLE" ? setBlock({ roomUnitId: unit.id, number: unit.number, startDate: day.date, endDate: day.date, reason: "" }) : null}>
            {day.state === "AVAILABLE" ? "·" : day.label}
          </button></td>)}
        </tr>))}
      </tbody></table></div>}
      {!!data?.roomTypes?.some((type) => type.unnumberedCount > 0) && <p className="mp-help-text">Some room types still have unassigned room numbers. <button type="button" className="mp-text-button" onClick={onManageRooms}>Manage rooms</button></p>}
    </div>
    {block && <div className="mp-surface mp-calendar-block-form"><div className="mp-section-heading"><h3>Block room {block.number}</h3><button type="button" className="mp-edit-button" onClick={() => setBlock(null)}><X size={16} />Cancel</button></div>
      <form onSubmit={saveBlock} className="mp-edit-form mp-edit-form--grid">
        <Field label="From date" type="date" required value={block.startDate} onChange={(v) => setBlock({ ...block, startDate: v })} />
        <Field label="To date (inclusive)" type="date" required min={block.startDate} value={block.endDate} onChange={(v) => setBlock({ ...block, endDate: v })} />
        <div className="mp-form-field--full"><Field label="Reason" value={block.reason} onChange={(v) => setBlock({ ...block, reason: v })} placeholder="Maintenance" /></div>
        <div className="mp-form-field--full"><button className="mp-primary-button" disabled={saving} type="submit"><LockKeyhole size={16} />Block dates</button></div>
      </form>
    </div>}
  </div>;
}

const blankStay = () => ({ guestName: "", guestEmail: "", guestPhone: "", roomTypeId: "", roomUnitId: "", adults: 1, children: 0, checkInDate: dateKey(new Date()), checkOutDate: shiftDays(dateKey(new Date()), 1), expectedArrivalTime: "", specialRequests: "" });
export function GuestStaysTab({ property }) {
  const [date, setDate] = useState(dateKey(new Date()));
  const [tab, setTab] = useState("arrivals");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(blankStay);

  const load = useCallback(async () => {
    const result = await myPropertyApi.listGuestStays(property.id, { date, tab, page, search });
    setData(result);
  }, [property.id, date, tab, page, search]);
  useEffect(() => {
    let cancelled = false; setLoading(true); setError(""); setData(null);
    myPropertyApi.listGuestStays(property.id, { date, tab, page, search }).then((result) => {
      if (!cancelled) setData(result);
    }).catch((e) => { if (!cancelled) setError(e.message || "Unable to load guest stays."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [property.id, date, tab, page, search]);
  async function saveStay(event) {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await myPropertyApi.createGuestStay(property.id, {
        ...draft, adults: Number(draft.adults), children: Number(draft.children),
        roomUnitId: draft.roomUnitId || null,
      });
      setCreating(false); setDraft(blankStay()); await load(); setSuccess("Guest reservation created.");
    } catch (e) { setError(e.message || "Unable to create reservation."); }
    finally { setSaving(false); }
  }
  async function stayAction(stay, action) {
    const prompt = action === "check-in" ? `Check in ${stay.guestName}?` : action === "check-out" ? `Check out ${stay.guestName}?` : `Cancel ${stay.guestName}'s reservation?`;
    if (!window.confirm(prompt)) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      if (action === "check-in") await myPropertyApi.checkInGuest(property.id, stay.id);
      else if (action === "check-out") await myPropertyApi.checkOutGuest(property.id, stay.id);
      else await myPropertyApi.cancelGuest(property.id, stay.id);
      await load(); setSuccess(`Reservation ${action === "check-in" ? "checked in" : action === "check-out" ? "checked out" : "cancelled"}.`);
    } catch (e) { setError(e.message || "Unable to update reservation."); }
    finally { setSaving(false); }
  }
  const update = (name, value) => setDraft((current) => ({ ...current, [name]: value }));
  return <div className="mp-tab-panel">
    <TabHeader title="Guest stays" description="Manage arrivals, in-house guests and departures." action={<button type="button" className="mp-primary-button" onClick={() => setCreating((v) => !v)}><Plus size={16} />New reservation</button>} />
    <Message error={error} success={success} />
    {creating && <div className="mp-surface mp-guest-create"><div className="mp-section-heading"><h3>New guest reservation</h3><button type="button" className="mp-edit-button" onClick={() => setCreating(false)}><X size={16} />Cancel</button></div>
      <form className="mp-edit-form mp-edit-form--grid" onSubmit={saveStay}>
        <Field label="Guest name" required value={draft.guestName} onChange={(v) => update("guestName", v)} />
        <Field label="Guest email" type="email" value={draft.guestEmail} onChange={(v) => update("guestEmail", v)} />
        <Field label="Guest phone" value={draft.guestPhone} onChange={(v) => update("guestPhone", v)} />
        <Field label="Room type" required value={draft.roomTypeId} onChange={(v) => { update("roomTypeId", v); update("roomUnitId", ""); }}><option value="">Choose room type</option>{(property.rooms ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Field>
        <Field label="Specific room (optional)" value={draft.roomUnitId} onChange={(v) => update("roomUnitId", v)}><option value="">Assign later</option>{(property.rooms ?? []).find((r) => r.id === draft.roomTypeId)?.units?.map((u) => <option key={u.id} value={u.id}>{u.number}</option>)}</Field>
        <Field label="Adults" type="number" min={1} required value={draft.adults} onChange={(v) => update("adults", v)} />
        <Field label="Children" type="number" min={0} required value={draft.children} onChange={(v) => update("children", v)} />
        <Field label="Check-in date" type="date" required value={draft.checkInDate} onChange={(v) => update("checkInDate", v)} />
        <Field label="Check-out date" type="date" min={draft.checkInDate} required value={draft.checkOutDate} onChange={(v) => update("checkOutDate", v)} />
        <Field label="Expected arrival time" type="time" value={draft.expectedArrivalTime} onChange={(v) => update("expectedArrivalTime", v)} />
        <div className="mp-form-field--full"><Field label="Special requests" type="textarea" value={draft.specialRequests} onChange={(v) => update("specialRequests", v)} /></div>
        <div className="mp-form-field--full"><button type="submit" className="mp-primary-button" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Create reservation"}</button></div>
      </form>
    </div>}
    <div className="mp-surface">
      <div className="mp-guest-toolbar"><div className="mp-guest-filter-tabs">
        {[{id:"arrivals",label:"Arrivals",count:data?.counts?.arrivals},{id:"in_house",label:"In-house",count:data?.counts?.inHouse},{id:"departures",label:"Departures",count:data?.counts?.departures}].map((t) => <button type="button" key={t.id} className={tab === t.id ? "is-active" : ""} onClick={() => { setTab(t.id); setPage(1); }}>{t.label} <span>{t.count ?? "–"}</span></button>)}
      </div><label className="mp-form-field"><span>Date</span><input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} /></label></div>
      <form className="mp-search-form" onSubmit={(e) => { e.preventDefault(); setSearch(query); setPage(1); }}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guest or booking reference" aria-label="Search reservations" /><button type="submit" className="mp-secondary-button">Search</button></form>
      {loading ? <p className="mp-empty-copy">Loading guest stays…</p> : data?.reservations?.length ? <div className="mp-stays-list">{data.reservations.map((stay) => <article className="mp-manage-row" key={stay.id}>
        <div className="mp-guest-icon"><Users size={22} /></div><div className="mp-manage-row__info"><h3>{stay.guestName}</h3><p>{stay.bookingReference} · {stay.roomType?.name || "Room"}{stay.roomUnit ? ` ${stay.roomUnit.number}` : " · Not assigned"}</p><p>{formatDate(stay.checkInDate)} – {formatDate(stay.checkOutDate)} · {titleCase(stay.status)}</p></div>
        <div className="mp-stay-actions">{stay.status === "EXPECTED" && <><button type="button" disabled={saving} className="mp-primary-button" onClick={() => stayAction(stay, "check-in")}>Check in</button><button type="button" disabled={saving} className="mp-text-button" onClick={() => stayAction(stay, "cancel")}>Cancel</button></>}
          {stay.status === "IN_HOUSE" && <button type="button" className="mp-primary-button" disabled={saving} onClick={() => stayAction(stay, "check-out")}>Check out</button>}
        </div>
      </article>)}</div> : <div className="mp-empty-inline"><Clock3 size={28} /><p>No {tab.replace("_", "-")} for this date.</p></div>}
      {data?.pagination?.totalPages > 1 && <div className="mp-pagination"><button type="button" className="mp-secondary-button" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} />Previous</button><span>Page {page} of {data.pagination.totalPages}</span><button type="button" className="mp-secondary-button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next<ChevronRight size={14} /></button></div>}
    </div>
  </div>;
}
