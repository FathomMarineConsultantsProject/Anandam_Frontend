import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import RescheduleModal from "../components/marketplace/RescheduleModal";
import { acceptProposal, declineProposal, getMyEnquiryById, requestAnotherTime } from "../api/marketplaceApi";
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

export default function EnquiryDetailsPage() {
  const { enquiryId } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await getMyEnquiryById(enquiryId);
      setEnquiry(data.enquiry);
    } catch (err) {
      setError(err?.message || "Unable to load enquiry.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [enquiryId]);

  const activeProposal = useMemo(() => enquiry?.proposals?.find((p) => p.status === "PENDING" && p.proposedBy === "PRACTITIONER"), [enquiry]);

  async function confirm(proposal) {
    try {
      setProcessing(true); setError("");
      await acceptProposal(enquiryId, proposal.id);
      await load();
    } catch (err) { setError(err?.message || "Unable to confirm session."); }
    finally { setProcessing(false); }
  }

  async function sendNewTime(values) {
    try {
      setProcessing(true); setError("");
      const proposedStart = zonedDateTimeToUtc(values.date, values.time, values.timeZone);
      await requestAnotherTime(enquiryId, activeProposal.id, { proposedStart, durationMinutes: values.durationMinutes, timeZone: values.timeZone, sessionType: activeProposal.sessionType || "VIDEO", message: values.reason });
      setRescheduling(null);
      await load();
    } catch (err) { setError(err?.message || "Unable to request another time."); }
    finally { setProcessing(false); }
  }

  async function decline() {
    if (!activeProposal || !window.confirm("Decline this proposed time?")) return;
    try { setProcessing(true); await declineProposal(enquiryId, activeProposal.id); await load(); }
    catch (err) { setError(err?.message || "Unable to decline proposal."); }
    finally { setProcessing(false); }
  }

  if (loading) return <div className="mk-loading">Loading enquiry…</div>;
  if (!enquiry) return <div className="mk-loading">{error || "Enquiry not found."}</div>;

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading"><div><button className="mk-back-button" onClick={() => navigate("/marketplace/enquiries")}>←&nbsp; Back</button><h1>Marketplace</h1><p>Your enquiry and session status</p></div></header>
      {error && <div className="mk-error-banner">{error}</div>}
      <EnquiryStatusCard enquiry={enquiry} onOpen={() => {}} onConfirm={confirm} onAskNewTime={(proposal) => setRescheduling(proposal)} confirming={processing} />
      {activeProposal && enquiry.status === "TIME_PROPOSED" && <div className="mk-inline-actions"><button className="mk-outline-button" onClick={decline} disabled={processing}>Decline proposed time</button></div>}
      {enquiry.status === "CONFIRMED" && enquiry.appointment && <div className="mk-detail-action-bar"><button className="mk-primary-button" onClick={() => navigate(`/marketplace/appointments/${enquiry.appointment.id}/join`)}>Join call</button></div>}
      {rescheduling && <RescheduleModal title="Ask for new time" currentText={new Date(rescheduling.proposedStart).toLocaleString()} defaultDuration={rescheduling.durationMinutes || 40} timeZone={rescheduling.timeZone || enquiry.timeZone || "Asia/Kolkata"} onClose={() => setRescheduling(null)} onSubmit={sendNewTime} submitting={processing} error={error} />}
    </main>
  );
}
