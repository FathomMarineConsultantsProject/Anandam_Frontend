import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RescheduleModal from "./RescheduleModal";
import MarketplaceIcon from "./MarketplaceIcon";
import { rescheduleConfirmedAppointment } from "../../api/marketplaceApi";

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function localDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value))
    : "—";
}

function localTime(value) {
  return value
    ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value))
    : "—";
}

function zonedDateTimeToUtc(dateString, timeString, timeZone) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour, minute] = timeString.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let i = 0; i < 2; i += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).filter((p) => p.type !== "literal").map((p) => [p.type, Number(p.value)])
    );
    const shown = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
    guess += target - shown;
  }
  return new Date(guess).toISOString();
}

export default function SessionCard({ appointment, onChanged }) {
  const navigate = useNavigate();
  const [showReschedule, setShowReschedule] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const practitioner = appointment?.practitioner;
  const name = practitioner?.user?.fullName || "Practitioner";

  async function submitReschedule(values) {
    try {
      setSubmitting(true);
      setError("");
      const proposedStart = zonedDateTimeToUtc(values.date, values.time, values.timeZone);
      await rescheduleConfirmedAppointment(appointment.enquiryId, {
        proposedStart,
        durationMinutes: values.durationMinutes,
        timeZone: values.timeZone,
        sessionType: appointment.sessionType || "VIDEO",
        message: values.reason,
      });
      setShowReschedule(false);
      onChanged?.();
    } catch (err) {
      setError(err?.message || "Unable to send reschedule request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="mk-session-card">
        <div className="mk-session-person">
          <div className="mk-session-avatar">
            {practitioner?.profileImageUrl ? <img src={practitioner.profileImageUrl} alt={name} /> : name[0]}
          </div>
          <div><h3>{name}</h3><p>{practitioner?.professionalTitle || "Practitioner"}</p></div>
        </div>

        <SessionInfo icon="date" label="Date" value={localDate(appointment.scheduledStart)} />
        <SessionInfo icon="time" label="Time" value={localTime(appointment.scheduledStart)} />
        <SessionInfo icon="payment" label="Fees" value={practitioner?.sessionPrice ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")}` : "—"} />

        <div className="mk-session-actions">
          <div className="mk-session-status-row">
            <span className="mk-pill mk-pill-ok">{appointment.status === "CONFIRMED" ? "Scheduled" : appointment.status}</span>
            <button className="mk-dots-button" type="button" aria-label="Session options"><MarketplaceIcon name="more" /></button>
          </div>
          {appointment.status === "CONFIRMED" && (
            <div className="mk-session-button-row">
              <button className="mk-link-button" onClick={() => setShowReschedule(true)}>Reschedule</button>
              <button className="mk-primary-button mk-join-call-button" onClick={() => navigate(`/marketplace/appointments/${appointment.id}/join`)}>
                <MarketplaceIcon name="video" className="mk-button-icon" />
                Join call
              </button>
            </div>
          )}
        </div>
      </section>

      {showReschedule && (
        <RescheduleModal
          currentText={formatDateTime(appointment.scheduledStart)}
          defaultDuration={Math.max(1, Math.round((new Date(appointment.scheduledEnd) - new Date(appointment.scheduledStart)) / 60000))}
          timeZone={appointment.timeZone || "Asia/Kolkata"}
          onClose={() => setShowReschedule(false)}
          onSubmit={submitReschedule}
          submitting={submitting}
          error={error}
        />
      )}
    </>
  );
}

function SessionInfo({ icon, label, value }) {
  return (
    <div className="mk-session-detail">
      <div className="mk-info-label"><MarketplaceIcon name={icon} /><span>{label}</span></div>
      <strong>{value}</strong>
    </div>
  );
}
