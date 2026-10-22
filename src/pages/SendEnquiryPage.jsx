import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SendEnquiryModal from "../components/marketplace/SendEnquiryModal";
import { createEnquiry, getPractitionerBySlug } from "../api/marketplaceApi";
import "../styles/marketplace.css";

function zonedDateTimeToUtc(dateString, timeString, timeZone) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  for (let i = 0; i < 2; i += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)]));
    const shown = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
    guess += target - shown;
  }
  return new Date(guess).toISOString();
}

export default function SendEnquiryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPractitionerBySlug(slug).then((data) => active && setPractitioner(data.practitioner)).catch((err) => active && setError(err?.message || "Unable to load practitioner.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  async function submit(form) {
    try {
      setSubmitting(true);
      setError("");
      const requestedStart = zonedDateTimeToUtc(form.date, form.from, form.timeZone);
      const requestedEnd = zonedDateTimeToUtc(form.date, form.to, form.timeZone);
      if (new Date(requestedEnd) <= new Date(requestedStart)) throw new Error("The end time must be after the start time.");
      const data = await createEnquiry({ practitionerId: practitioner.id, supportTopic: form.supportTopic, message: form.message.trim() || undefined, requestedStart, requestedEnd, timeZone: form.timeZone, preferredLanguage: form.preferredLanguage });
      navigate(`/marketplace/enquiries/${data.enquiry.id}`, { replace: true, state: { enquirySent: true } });
    } catch (err) {
      setError(err?.message || "Unable to send enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="mk-loading">Loading…</div>;
  if (!practitioner) return <div className="mk-loading">{error || "Practitioner not found."}</div>;

  return (
    <main className="marketplace-page mk-enquiry-overlay-page">
      <div className="mk-enquiry-background"><div className="mk-page-heading"><div><h1>Marketplace</h1><p>Explore wellness stays and find practitioners who support your wellbeing</p></div></div></div>
      <SendEnquiryModal practitioner={practitioner} onClose={() => navigate(-1)} onSubmit={submit} submitting={submitting} error={error} />
    </main>
  );
}
