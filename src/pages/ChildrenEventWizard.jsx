import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CalendarDays, Check, Image as ImageIcon,
  Plus, Trash2, Upload, X,
} from "lucide-react";
import { myPropertyApi } from "../api/myPropertyApi";
import "../styles/childrenEventWizard.css";

const STEP_TITLES = [
  "Event details", "Dates & schedule", "Capacity & guest requirements",
  "Pricing & accommodation", "Inclusions & guest notes", "Review and publish",
];
const LABELS = {
  "4-7": "Ages 4–7", "8-12": "Ages 8–12", "13-17": "Ages 13–17", OTHER: "Other",
};
const GUARDIANS = [
  ["REQUIRED_TO_STAY", "Required to stay"],
  ["WELCOME_TO_STAY", "Welcome to stay"],
  ["DROP_OFF_PICK_UP", "Drop-off and pick-up only"],
];
const EMPTY_OCCURRENCE = () => ({ startDate: "", endDate: "", startTime: "", endTime: "", schedule: "" });
const emptyForm = () => ({
  name: "", shortDescription: "", venue: "", ageGroups: [], minimumAge: "", maximumAge: "",
  occurrences: [EMPTY_OCCURRENCE()], timeZone: "Asia/Kolkata", maxParticipants: "",
  minParticipants: "", experienceLevel: "", guardianPolicy: "", maxAccompanyingAdultsPerChild: "",
  pricingType: "PER_PERSON", currency: "INR", price: "", childrenPerPackage: "",
  guardianParticipationIncluded: null, additionalAdultPrice: "", accommodationIncluded: false,
  roomAllocations: {}, whatsIncluded: "", whatToBring: "", guardianInstructions: "",
  whatsNotIncluded: "", cancellationPolicy: "",
});

function formatLocal(date) {
  if (!date) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(date));
  const get = (name) => parts.find((part) => part.type === name)?.value || "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}
function fromRecord(event) {
  if (!event?.id) return emptyForm();
  const child = event.childrenDetails || {};
  const dates = (event.occurrences || []).map((occ) => {
    const start = formatLocal(occ.startAt);
    const end = formatLocal(occ.endAt);
    return { startDate: start.date, endDate: end.date, startTime: start.time,
      endTime: end.time, schedule: occ.schedule || "" };
  });
  return {
    ...emptyForm(), ...event,
    ageGroups: child.ageGroups || [], minimumAge: child.minimumAge ?? "",
    maximumAge: child.maximumAge ?? "", guardianPolicy: child.guardianPolicy || "",
    maxAccompanyingAdultsPerChild: child.maxAccompanyingAdultsPerChild ?? "",
    guardianParticipationIncluded: child.guardianParticipationIncluded ?? null,
    additionalAdultPrice: child.additionalAdultPrice ?? "",
    childrenPerPackage: child.childrenPerPackage ?? "",
    guardianInstructions: child.guardianInstructions || "",
    maxParticipants: event.maxParticipants ?? "", minParticipants: event.minParticipants ?? "",
    price: event.price ?? "", accommodationIncluded: Boolean(event.accommodationIncluded),
    occurrences: dates.length ? dates : [EMPTY_OCCURRENCE()], timeZone: "Asia/Kolkata",
    roomAllocations: Object.fromEntries((event.allocations || []).map((row) => [row.roomTypeId, row.quantity])),
  };
}
const integerOrNull = (value) => value === "" || value === null || value === undefined ? null : Number(value);
function toIso(day, time) {
  // The design currently specifies India Standard Time. Explicit +05:30
  // prevents the viewer's browser time zone from shifting event dates.
  return new Date(`${day}T${time}:00+05:30`).toISOString();
}
function buildPayload(form, step) {
  const completeTimes = form.occurrences.filter((occ) =>
    occ.startDate && occ.endDate && occ.startTime && occ.endTime && occ.schedule.trim());
  const occurrenceData = completeTimes.map((occ) => ({
    startAt: toIso(occ.startDate, occ.startTime),
    endAt: toIso(occ.endDate, occ.endTime),
    timeZone: form.timeZone, schedule: occ.schedule.trim(),
  }));
  const multiDay = completeTimes.some((occ) => occ.endDate > occ.startDate);
  return {
    draftStep: step,
    listingType: multiDay ? "MULTI_DAY_RETREAT" : "EVENT",
    name: form.name, shortDescription: form.shortDescription, venue: form.venue,
    maxParticipants: integerOrNull(form.maxParticipants), minParticipants: integerOrNull(form.minParticipants),
    experienceLevel: form.experienceLevel,
    ageRequirements: form.ageGroups.map((g) => LABELS[g]).join(", "),
    pricingType: form.pricingType, currency: form.currency,
    price: form.pricingType === "FREE" || form.price === "" ? null : String(form.price),
    accommodationIncluded: Boolean(form.accommodationIncluded),
    whatsIncluded: form.whatsIncluded, whatToBring: form.whatToBring,
    whatsNotIncluded: form.whatsNotIncluded, cancellationPolicy: form.cancellationPolicy,
    occurrences: occurrenceData,
    roomAllocations: form.accommodationIncluded
      ? Object.entries(form.roomAllocations).filter(([, quantity]) => Number(quantity) > 0)
        .map(([roomTypeId, quantity]) => ({ roomTypeId, quantity: Number(quantity) }))
      : [],
    childrenDetails: {
      ageGroups: form.ageGroups,
      minimumAge: integerOrNull(form.minimumAge), maximumAge: integerOrNull(form.maximumAge),
      guardianPolicy: form.guardianPolicy || null,
      maxAccompanyingAdultsPerChild: integerOrNull(form.maxAccompanyingAdultsPerChild),
      guardianParticipationIncluded: form.guardianParticipationIncluded,
      additionalAdultPrice: form.additionalAdultPrice === "" ? null : String(form.additionalAdultPrice),
      childrenPerPackage: integerOrNull(form.childrenPerPackage),
      guardianInstructions: form.guardianInstructions,
    },
  };
}
function validationError(step, f, record) {
  if (step === 1) {
    if (!f.name.trim() || !f.shortDescription.trim() || !f.venue.trim()) return "Complete the event name, description and meeting point.";
    if (!f.ageGroups.length) return "Select at least one age group.";
    if (f.ageGroups.includes("OTHER") && (f.minimumAge === "" || f.maximumAge === "" || Number(f.minimumAge) > Number(f.maximumAge))) {
      return "Enter a valid minimum and maximum age.";
    }
    if (!(record?.images || []).some((photo) => photo.kind === "COVER")) return "Upload a cover photo before continuing.";
  }
  if (step === 2) {
    if (!f.occurrences.length) return "Add at least one schedule.";
    for (const date of f.occurrences) {
      if (!date.startDate || !date.endDate || !date.startTime || !date.endTime || !date.schedule.trim()) return "Complete the dates, times and activity schedule for every session.";
      if (toIso(date.endDate, date.endTime) <= toIso(date.startDate, date.startTime)) return "Each session must end after it starts.";
    }
  }
  if (step === 3 && (!Number.isInteger(Number(f.maxParticipants)) || Number(f.maxParticipants) < 1 || !f.guardianPolicy)) {
    return "Enter the maximum participant count and choose a guardian policy.";
  }
  if (step === 4) {
    if (f.pricingType !== "FREE" && !(Number(f.price) > 0)) return "Enter a price for the selected pricing option.";
    if (f.guardianPolicy !== "DROP_OFF_PICK_UP" && f.guardianParticipationIncluded === null) return "Choose whether guardian participation is included.";
    if (f.pricingType === "PER_PACKAGE" && !(Number(f.childrenPerPackage) >= 1)) return "Enter how many children are included per package.";
    if (f.accommodationIncluded && !Object.values(f.roomAllocations).some((quantity) => Number(quantity) > 0)) return "Choose at least one room type for included accommodation.";
  }
  if (step === 5 && (!f.whatsIncluded.trim() || !f.cancellationPolicy.trim())) return "Complete inclusions and the cancellation policy.";
  return "";
}
const money = (value, currency = "INR") => value === "" || value === null || value === undefined ? "—"
  : new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value));

function Field({ label, value, onChange, required = false, children, multiline = false, type = "text", placeholder, min, hint }) {
  return <label className="ce-field"><span className="ce-label">{label}{required && <b> *</b>}</span>
    {children ? <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>{children}</select>
      : multiline ? <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} min={min} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    {hint ? <small>{hint}</small> : null}</label>;
}
function Choice({ selected, onSelect, title, caption }) {
  return <button type="button" className={`ce-choice ${selected ? "is-selected" : ""}`} onClick={onSelect}>
    <span><i className="ce-radio">{selected ? <span /> : null}</i><strong>{title}</strong></span><small>{caption}</small></button>;
}
function ReviewRow({ name, value }) { return <div className="ce-review-row"><strong>{name}</strong><p>{value || "—"}</p></div>; }

export default function ChildrenEventWizard({ property, initialEvent = null, onClose, onChanged }) {
  const [record, setRecord] = useState(initialEvent?.id ? initialEvent : null);
  const [form, setForm] = useState(() => fromRecord(initialEvent));
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const cover = record?.images?.find((photo) => photo.kind === "COVER");
  const gallery = (record?.images || []).filter((photo) => photo.kind === "GALLERY");
  const pageTitle = initialEvent?.id ? "Edit children's event or retreat" : "Create event or retreat";
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  async function notifyUpdated() {
    // Saving must not be reported as failed just because the list refresh fails.
    try { await onChanged?.(); }
    catch (error) { console.warn("Event saved, but listing refresh failed:", error); }
  }
  const setOccurrence = (index, key, value) => setForm((old) => ({ ...old,
    occurrences: old.occurrences.map((row, i) => i === index ? { ...row, [key]: value } : row),
  }));
  const isPublished = record?.status === "PUBLISHED";
  const groupCaption = useMemo(() => form.ageGroups.map((key) => LABELS[key]).join(", "), [form.ageGroups]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  async function ensureDraft() {
    if (record?.id) return record;
    const created = await myPropertyApi.createEvent(property.id, {
      listingType: "EVENT", childrenDetails: { ageGroups: [] },
    });
    if (!created?.event?.id) throw new Error("The server did not return a new event ID.");
    setRecord(created.event);
    await notifyUpdated();
    return created.event;
  }
  async function saveDraft(nextStep = step, finish = false) {
    setBusy(true); setError(""); setSuccess("");
    try {
      const current = await ensureDraft();
      if (current.status === "PUBLISHED") throw new Error("Unpublish this event before editing it.");
      const saved = await myPropertyApi.updateEvent(property.id, current.id, buildPayload(form, nextStep));
      if (!saved?.event) throw new Error("The server did not return the saved event.");
      setRecord(saved.event);
      await notifyUpdated();
      if (finish) {
        const published = await myPropertyApi.publishEvent(property.id, saved.event.id);
        setRecord(published.event);
        await notifyUpdated();
        setSuccess("Your children's event is published and visible to the marketplace.");
      } else if (nextStep !== step) setStep(nextStep);
      else setSuccess("Draft saved.");
    } catch (e) { setError(e?.data?.message || e.message || "Unable to save this event."); }
    finally { setBusy(false); }
  }
  async function uploadPhoto(e, kind) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const current = await ensureDraft();
      for (const file of files.slice(0, kind === "COVER" ? 1 : Math.max(0, 12 - gallery.length))) {
        await myPropertyApi.uploadEventImage(property.id, current.id, file, kind);
      }
      const updated = await myPropertyApi.getEvent(property.id, current.id);
      setRecord(updated.event);
      await notifyUpdated();
      setSuccess("Photo uploaded.");
    } catch (err) { setError(err?.data?.message || err.message || "Unable to upload the photo."); }
    finally { e.target.value = ""; setBusy(false); }
  }
  async function removePhoto(photo) {
    if (!window.confirm("Remove this event photo?")) return;
    setBusy(true); setError("");
    try {
      await myPropertyApi.deleteEventImage(property.id, record.id, photo.id);
      const data = await myPropertyApi.getEvent(property.id, record.id);
      setRecord(data.event);
      await notifyUpdated();
    } catch (e) { setError(e.message || "Unable to remove the photo."); }
    finally { setBusy(false); }
  }
  async function removeEvent() {
    if (!record?.id || !window.confirm("Delete this draft event permanently?")) return;
    setBusy(true); setError("");
    try { await myPropertyApi.deleteEvent(property.id, record.id); await notifyUpdated(); onClose(); }
    catch (e) { setError(e.message || "Unable to delete this event."); setBusy(false); }
  }
  async function unpublish() {
    setBusy(true); setError("");
    try {
      const result = await myPropertyApi.unpublishEvent(property.id, record.id);
      setRecord(result.event); await notifyUpdated(); setSuccess("Event unpublished. You can edit it now.");
    } catch (e) { setError(e.message || "Unable to unpublish."); }
    finally { setBusy(false); }
  }
  async function next() {
    const message = validationError(step, form, record);
    if (message) { setError(message); return; }
    if (step < 6) await saveDraft(step + 1);
    else await saveDraft(6, true);
  }
  function back() { setError(""); if (step === 1) onClose(); else setStep(step - 1); }

  return <div className="ce-wizard">
    <div className="ce-heading"><button type="button" onClick={onClose} className="ce-back-link"><ArrowLeft size={15} /> Back</button>
      <h1>{pageTitle}</h1><p>{property.name} · {[property.city, property.stateRegion].filter(Boolean).join(", ")}</p></div>
    <section className="ce-panel">
      <div className="ce-progress"><div className="ce-progress-track"><div style={{ width: `${step * 100 / 6}%` }} /></div><small>Step {step} of 6</small></div>
      <div className="ce-section-title"><h2>{STEP_TITLES[step - 1]}</h2><p>{[
        "Start with the essentials. Help guests picture their experience.",
        "Set the dates and give guests a feel for the rhythm of their stay.",
        "Let guests know who the experience is for.",
        "Set your price and reserve rooms for residential guests.",
        "Make it easy for guests to arrive prepared.",
        "Check your event details before publishing.",
      ][step - 1]}</p></div>
      {error ? <div className="ce-alert" role="alert">{error}</div> : null}
      {success ? <div className="ce-success" role="status">{success}</div> : null}
      {isPublished && <div className="ce-success">This event is published. Unpublish it before editing any details.</div>}

      {step === 1 && <div className="ce-fields">
        <div className="ce-field"><span className="ce-label">Listing type <b>*</b></span>
          <div className="ce-choice-grid ce-choice-grid--four">
            <Choice title="Event" caption="A standalone activity or session." selected={false} onSelect={() => { setError("Use the New event button for a general event."); }} />
            <Choice title="Day programme" caption="A half-day or full-day itinerary." selected={false} onSelect={() => { setError("Use the New event button for general day programmes."); }} />
            <Choice title="Multi-day retreat" caption="A programme across two or more days." selected={false} onSelect={() => { setError("This children's event can span multiple days. Add the dates in Step 2."); }} />
            <Choice title="Children’s event or retreat" caption="A day activity or multi-day programme designed for children." selected onSelect={() => setError("")} />
          </div>
        </div>
        <Field label="Event or retreat name" required placeholder="Enter the name guests will see" value={form.name} onChange={(v) => update("name", v)} />
        <div className="ce-field"><span className="ce-label">Which age groups can attend? <b>*</b></span>
          <div className="ce-age-chips">{Object.entries(LABELS).map(([value, label]) => <button key={value} type="button"
            className={form.ageGroups.includes(value) ? "is-selected" : ""}
            onClick={() => update("ageGroups", form.ageGroups.includes(value) ? form.ageGroups.filter((item) => item !== value) : [...form.ageGroups, value])}>
            {form.ageGroups.includes(value) ? <Check size={13} /> : null}{label}</button>)}</div>
        </div>
        {form.ageGroups.includes("OTHER") ? <div className="ce-grid-two">
          <Field label="Minimum age" required type="number" min={0} placeholder="e.g. 2" value={form.minimumAge} onChange={(v) => update("minimumAge", v)} />
          <Field label="Maximum age" required type="number" min={0} placeholder="e.g. 3" value={form.maximumAge} onChange={(v) => update("maximumAge", v)} />
        </div> : null}
        <Field label="Short description" required multiline placeholder="Briefly describe what guests will do and what they can expect." value={form.shortDescription} onChange={(v) => update("shortDescription", v)} />
        <Field label="Venue or meeting point" required placeholder="Enter where guests should meet" value={form.venue} onChange={(v) => update("venue", v)} />
        <div className="ce-grid-three">
          <div className="ce-photo-group"><span className="ce-label">Cover photo <b>*</b></span>{cover ? <div className="ce-photo-tile"><img src={cover.url} alt="Event cover"/><button type="button" aria-label="Remove cover" disabled={busy} onClick={() => removePhoto(cover)}><X size={16}/></button></div> : <label className="ce-photo-tile"><ImageIcon size={26}/><span>Add event photo</span><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadPhoto(e, "COVER")} disabled={busy}/></label>}</div>
          <div className="ce-photo-group ce-gallery-group"><span className="ce-label">Gallery photos (optional)</span><div className="ce-gallery-slots">
            {gallery.slice(0, 2).map((photo) => <div className="ce-photo-tile" key={photo.id}><img src={photo.url} alt="Event gallery"/><button type="button" onClick={() => removePhoto(photo)} disabled={busy} aria-label="Remove image"><X size={16}/></button></div>)}
            {Array.from({ length: Math.min(2, Math.max(0, 12 - gallery.length)) }).slice(0, Math.max(0, 2 - Math.min(gallery.length, 2))).map((_, index) =>
              <label className="ce-photo-tile" key={`empty-${index}`}><ImageIcon size={26}/><span>Add event photo</span>
                <input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => uploadPhoto(e, "GALLERY")} disabled={busy}/>
              </label>)}
            {gallery.length >= 2 && gallery.length < 12 ? <label className="ce-gallery-more"><Upload size={14}/> Add more gallery photos<input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => uploadPhoto(e, "GALLERY")} disabled={busy}/></label> : null}</div></div>
        </div><p className="ce-help">Add the spaces and moments guests can look forward to. Up to 5 MB per image.</p>
      </div>}

      {step === 2 && <div className="ce-fields">
        {form.occurrences.map((occ, i) => <div className="ce-schedule-card" key={i}>
          {form.occurrences.length > 1 ? <div className="ce-schedule-head"><strong>Schedule {i + 1}</strong><button type="button" onClick={() => update("occurrences", form.occurrences.filter((_, n) => i !== n))}><Trash2 size={15}/> Remove</button></div> : null}
          <div className="ce-grid-two">
            <Field label="Start date" required type="date" value={occ.startDate} onChange={(v) => setOccurrence(i, "startDate", v)} />
            <Field label="End date" required type="date" value={occ.endDate} onChange={(v) => setOccurrence(i, "endDate", v)} />
            <Field label="Start time" required type="time" value={occ.startTime} onChange={(v) => setOccurrence(i, "startTime", v)} hint="India Standard Time (IST)" />
            <Field label="End time" required type="time" value={occ.endTime} onChange={(v) => setOccurrence(i, "endTime", v)} hint="India Standard Time (IST)" />
          </div><Field label="Schedule" required multiline placeholder="List each day's activities and approximate start times" value={occ.schedule} onChange={(v) => setOccurrence(i, "schedule", v)} />
        </div>)}
        <div className="ce-schedule-bottom"><p>Each added occurrence is booked separately. A retreat must span more than one calendar day.</p>
          <button type="button" onClick={() => update("occurrences", [...form.occurrences, EMPTY_OCCURRENCE()])}><Plus size={15}/> Add another schedule</button></div>
      </div>}

      {step === 3 && <div className="ce-fields">
        <div className="ce-grid-two">
          <Field label="Maximum participants" required type="number" min={1} value={form.maxParticipants} placeholder="Enter maximum number of guests" onChange={(v) => update("maxParticipants", v)} hint="Guest capacity, not the number of rooms." />
          <Field label="Minimum participants (optional)" type="number" min={0} value={form.minParticipants} placeholder="Enter minimum number of guests" onChange={(v) => update("minParticipants", v)} hint="Leave blank if there's no minimum." />
        </div><Field label="Experience level (optional)" value={form.experienceLevel} onChange={(v) => update("experienceLevel", v)}><option value="">Select experience level</option><option value="All levels">All levels</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></Field>
        <div className="ce-grid-two"><div className="ce-field"><span className="ce-label">Can parents or guardians attend? <b>*</b></span>
          <div className="ce-radio-inline">{GUARDIANS.map(([value, label]) => <label key={value}><input type="radio" name="guardian-policy" checked={form.guardianPolicy === value} onChange={() => update("guardianPolicy", value)} />{label}</label>)}</div></div>
          <Field label="Maximum accompanying adults per child" type="number" min={0} placeholder="e.g. 2" value={form.maxAccompanyingAdultsPerChild} onChange={(v) => update("maxAccompanyingAdultsPerChild", v)} />
        </div>
      </div>}

      {step === 4 && <div className="ce-fields">
        <div className="ce-field"><span className="ce-label">Pricing type <b>*</b></span>
          <div className="ce-choice-grid ce-choice-grid--three">
            <Choice selected={form.pricingType === "FREE"} onSelect={() => update("pricingType", "FREE")} title="Free" caption="No charge to attend." />
            <Choice selected={form.pricingType === "PER_PERSON"} onSelect={() => update("pricingType", "PER_PERSON")} title="Per Child" caption="A price for each child." />
            <Choice selected={form.pricingType === "PER_PACKAGE"} onSelect={() => update("pricingType", "PER_PACKAGE")} title="Per package" caption="One price for the whole package." />
          </div>
        </div>
        <div className="ce-grid-two">
          <Field label="Currency" required value={form.currency} onChange={(v) => update("currency", v)}><option value="INR">INR · Indian Rupee</option><option value="USD">USD · US Dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · Pound Sterling</option></Field>
          {form.pricingType !== "FREE" && <Field label={form.pricingType === "PER_PACKAGE" ? "Package price" : "Price per Child"} required type="number" min={0} placeholder="Enter price" value={form.price} onChange={(v) => update("price", v)} />}
        </div>
        {form.pricingType === "PER_PACKAGE" && <Field label="Children included per package" required type="number" min={1} placeholder="e.g. 2" value={form.childrenPerPackage} onChange={(v) => update("childrenPerPackage", v)} />}
        <div className="ce-grid-two"><div className="ce-field"><span className="ce-label">Is parent or guardian participation included?</span>
          <div className="ce-radio-inline">{[[true, "Yes"], [false, "No"]].map(([value, label]) => <label key={label}><input type="radio" name="guardian-included" checked={form.guardianParticipationIncluded === value} onChange={() => update("guardianParticipationIncluded", value)} />{label}</label>)}</div></div>
          <Field label="Price per accompanying adult" type="number" min={0} placeholder="e.g. 750" value={form.additionalAdultPrice} onChange={(v) => update("additionalAdultPrice", v)} />
        </div>
        <div className="ce-field"><span className="ce-label">Is accommodation included? <b>*</b></span>
          <div className="ce-choice-grid ce-choice-grid--two"><Choice title="Yes" selected={form.accommodationIncluded} onSelect={() => update("accommodationIncluded", true)} />
            <Choice title="No" selected={!form.accommodationIncluded} onSelect={() => update("accommodationIncluded", false)} /></div></div>
        {form.accommodationIncluded && <div className="ce-rooms"><h3>Rooms reserved for this pricing option</h3><p>Rooms must be numbered in Rooms & Pricing before this event can be published.</p>
          <div className="ce-grid-two">{(property.rooms || []).map((room) => <Field key={room.id} label={`${room.name} — rooms reserved`} type="number" min={0} value={form.roomAllocations[room.id] ?? 0} onChange={(v) => update("roomAllocations", { ...form.roomAllocations, [room.id]: v })} hint={`${room.quantity} rooms in this room type.`}/>)}</div>
          {!property.rooms?.length && <p>Add a room type in Rooms & Pricing before reserving accommodation.</p>}
        </div>}
      </div>}

      {step === 5 && <div className="ce-fields">
        <Field label="What's included?" required multiline placeholder="List what's included for all guests, such as meals, activities, or equipment." value={form.whatsIncluded} onChange={(v) => update("whatsIncluded", v)} />
        <Field label="What should guests bring? (optional)" multiline placeholder="List anything guests should pack or bring with them." value={form.whatToBring} onChange={(v) => update("whatToBring", v)} />
        <Field label="Instructions for parents or guardians" multiline placeholder="Add check-in details, where to wait if staying, or where to drop off and pick up children." value={form.guardianInstructions} onChange={(v) => update("guardianInstructions", v)} />
        <Field label="What's not included? (optional)" multiline placeholder="List any costs or services guests need to arrange separately." value={form.whatsNotIncluded} onChange={(v) => update("whatsNotIncluded", v)} />
        <Field label="Cancellation policy" required multiline placeholder="Enter the cancellation deadline and refund terms." value={form.cancellationPolicy} onChange={(v) => update("cancellationPolicy", v)} hint="Guests can view the policy before booking." />
      </div>}

      {step === 6 && <div className="ce-review">
        <div className="ce-review-section"><div><h3>Event photos</h3><button type="button" onClick={() => setStep(1)}>Edit</button></div>
          <div className="ce-review-photos">{cover?.url ? <img src={cover.url} alt="Event cover" /> : null}{gallery.slice(0, 2).map((photo) => <img src={photo.url} key={photo.id} alt="Event gallery" />)}</div></div>
        <div className="ce-review-section"><div><h3>Event details</h3><button type="button" onClick={() => setStep(1)}>Edit</button></div>
          <ReviewRow name="Listing type" value="Children's event or retreat"/><ReviewRow name="Event or retreat name" value={form.name}/>
          <ReviewRow name="Who can attend" value={groupCaption}/><ReviewRow name="Description" value={form.shortDescription}/><ReviewRow name="Meeting point" value={form.venue}/></div>
        <div className="ce-review-section"><div><h3>Dates & schedule</h3><button type="button" onClick={() => setStep(2)}>Edit</button></div>
          {form.occurrences.map((occ, i) => <ReviewRow key={i} name={`Schedule ${i + 1}`} value={`${occ.startDate} ${occ.startTime} – ${occ.endDate} ${occ.endTime} IST · ${occ.schedule}`}/>)}</div>
        <div className="ce-review-section"><div><h3>Capacity & guest requirements</h3><button type="button" onClick={() => setStep(3)}>Edit</button></div>
          <ReviewRow name="Maximum participants" value={form.maxParticipants}/><ReviewRow name="Minimum participants" value={form.minParticipants}/>
          <ReviewRow name="Guardian policy" value={GUARDIANS.find(([v]) => v === form.guardianPolicy)?.[1]}/></div>
        <div className="ce-review-section"><div><h3>Pricing & accommodation</h3><button type="button" onClick={() => setStep(4)}>Edit</button></div>
          <ReviewRow name="Price" value={form.pricingType === "FREE" ? "Free" : money(form.price, form.currency)}/>
          <ReviewRow name="Accommodation included" value={form.accommodationIncluded ? "Yes" : "No"}/></div>
        <div className="ce-review-section"><div><h3>Inclusions & guest notes</h3><button type="button" onClick={() => setStep(5)}>Edit</button></div>
          <ReviewRow name="What's included" value={form.whatsIncluded}/><ReviewRow name="Guardian instructions" value={form.guardianInstructions}/>
          <ReviewRow name="Cancellation policy" value={form.cancellationPolicy}/></div>
      </div>}

      <div className="ce-actions"><button type="button" className="ce-link" onClick={back} disabled={busy}>{step === 1 ? "Cancel" : "Back"}</button>
        <div>{record?.id && !isPublished && <button type="button" className="ce-danger" onClick={removeEvent} disabled={busy}><Trash2 size={14}/> Delete draft</button>}
          {isPublished ? <button type="button" className="ce-secondary" onClick={unpublish} disabled={busy}>{busy ? "Working…" : "Unpublish event"}</button>
            : <><button type="button" className="ce-secondary" disabled={busy} onClick={() => saveDraft(step)}>{busy ? "Saving…" : "Save draft"}</button>
              <button type="button" className="ce-primary" disabled={busy} onClick={next}>{busy ? "Saving…" : step === 6 ? "Publish event" : "Continue"}</button></>}
        </div></div>
    </section>
  </div>;
}
