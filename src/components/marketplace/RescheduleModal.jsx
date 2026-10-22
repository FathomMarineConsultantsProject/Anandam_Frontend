import { useState } from "react";
import MarketplaceDatePicker from "./MarketplaceDatePicker";
import MarketplaceIcon from "./MarketplaceIcon";

function todayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RescheduleModal({ title = "Reschedule Session", currentText = "", defaultDuration = 40, timeZone = "Asia/Kolkata", onClose, onSubmit, submitting = false, error = "" }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  function submit(event) {
    event.preventDefault();
    onSubmit({ date, time, reason: reason.trim(), durationMinutes: defaultDuration, timeZone });
  }

  return (
    <div className="mk-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <form className="mk-reschedule-modal" onSubmit={submit}>
        <div className="mk-modal-heading-row">
          <div>
            <h2>{title}</h2>
            <p>Suggest a new time for your session</p>
          </div>
          <button type="button" className="mk-icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        {currentText && <div className="mk-current-time">Current confirmed time &amp; date : {currentText}</div>}

        <div className="mk-section-label mk-uppercase">Schedule</div>
        <div className="mk-two-fields">
          <label className="mk-field">
            <span className="sr-only">Date</span>
            <MarketplaceDatePicker value={date} onChange={setDate} minDate={todayValue()} placeholder="Select date" required />
          </label>
          <label className="mk-field">
            <span className="sr-only">Time</span>
            <div className="mk-input-with-icon">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              <MarketplaceIcon name="time" />
            </div>
          </label>
        </div>

        <label className="mk-field">
          <span className="mk-uppercase">Reason for Reschedule <b className="mk-required">*</b></span>
          <textarea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain why you need to reschedule." required />
        </label>

        {error && <div className="mk-form-error">{error}</div>}

        <div className="mk-modal-actions">
          <button type="button" className="mk-outline-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="mk-primary-button" disabled={!date || !time || !reason.trim() || submitting}>
            {submitting ? "Sending..." : "Send reschedule request"}
          </button>
        </div>
      </form>
    </div>
  );
}
