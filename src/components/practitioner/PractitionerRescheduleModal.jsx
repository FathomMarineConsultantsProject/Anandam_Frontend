import { useMemo, useState } from "react";
import MarketplaceDatePicker from "../marketplace/MarketplaceDatePicker";
import MarketplaceIcon from "../marketplace/MarketplaceIcon";
import {
  acceptUserProposal,
  proposePractitionerSessionTime,
} from "../../api/practitionerMarketplaceApi";

function formatDateTime(start, end) {
  if (!start) return "—";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(startDate);
  const startTime = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(startDate);
  const endTime = endDate
    ? new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(endDate)
    : "";
  return `${date}, ${startTime}${endTime ? ` - ${endTime}` : ""}`;
}

function todayValue() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default function PractitionerRescheduleModal({ enquiry, onClose, onSuccess }) {
  const userProposal = enquiry?.proposals?.find(
    (proposal) => proposal.status === "PENDING" && proposal.proposedBy === "USER"
  );
  const appointment = enquiry?.appointment;
  const browserTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);

  const [showCounter, setShowCounter] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const requestReason =
    userProposal?.userResponseMessage ||
    userProposal?.practitionerMessage ||
    enquiry?.message ||
    "The user requested a different session time.";

  const confirmNewTime = async () => {
    if (!userProposal) {
      setError("No pending user reschedule proposal was found.");
      return;
    }
    try {
      setBusy(true);
      setError("");
      await acceptUserProposal(enquiry.id, userProposal.id);
      onSuccess?.();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to confirm the new time.");
    } finally {
      setBusy(false);
    }
  };

  const sendCounter = async () => {
    if (!date || !time || !reason.trim()) {
      setError("Choose a date and time and add a reason for the new suggestion.");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const proposedStart = new Date(`${date}T${time}:00`);
      await proposePractitionerSessionTime(enquiry.id, {
        proposedStart: proposedStart.toISOString(),
        durationMinutes: userProposal?.durationMinutes || 20,
        timeZone: userProposal?.timeZone || enquiry?.timeZone || browserTimeZone,
        sessionType: userProposal?.sessionType || "VIDEO",
        message: reason.trim(),
      });
      onSuccess?.();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to suggest another time.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pr-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className={`pr-modal pr-reschedule-modal ${showCounter ? "expanded" : ""}`}>
        <div className="pr-modal-head pr-modal-head-lined">
          <div>
            <h2>Reschedule request</h2>
            <p>User would like to reschedule this session</p>
          </div>
          <button type="button" className="pr-close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="pr-current-time-box">
          Current confirmed time &amp; date : {formatDateTime(appointment?.scheduledStart, appointment?.scheduledEnd)}
        </div>

        <div className="pr-field pr-reason-display">
          <span>REASON FOR RESCHEDULE <b>*</b></span>
          <div>{requestReason}</div>
        </div>

        {showCounter && (
          <div className="pr-counter-section">
            <h3>Suggest another time</h3>
            <div className="pr-form-two pr-counter-date-time">
              <label className="pr-field">
                <span>Date</span>
                <MarketplaceDatePicker value={date} onChange={setDate} placeholder="mm/dd/yyyy" minDate={todayValue()} />
              </label>
              <label className="pr-field">
                <span>Time</span>
                <div className="pr-time-input-wrap">
                  <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
                  <MarketplaceIcon name="time" />
                </div>
              </label>
            </div>
            <label className="pr-field">
              <span>REASON FOR RESCHEDULE <b>*</b></span>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly explain why you need to reschedule." />
            </label>
          </div>
        )}

        {error && <div className="pr-form-error">{error}</div>}

        <div className="pr-reschedule-actions">
          <button
            type="button"
            className="pr-outline-button"
            disabled={busy}
            onClick={() => (showCounter ? sendCounter() : setShowCounter(true))}
          >
            Suggest another time
          </button>
          <button type="button" className="pr-primary-button" disabled={busy} onClick={confirmNewTime}>
            {busy ? "Working..." : "Confirm new time"}
          </button>
        </div>
      </div>
    </div>
  );
}
