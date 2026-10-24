import { useMemo, useState } from "react";
import MarketplaceDatePicker from "../marketplace/MarketplaceDatePicker";
import MarketplaceIcon from "../marketplace/MarketplaceIcon";
import { proposePractitionerSessionTime } from "../../api/practitionerMarketplaceApi";
import TimeDropdown from "../marketplace/TimeDropdown";

function todayValue() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatAvailability(enquiry) {
  if (!enquiry?.requestedStart) return "No preferred availability supplied";
  const start = new Date(enquiry.requestedStart);
  const end = enquiry.requestedEnd ? new Date(enquiry.requestedEnd) : null;
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endTime = end
    ? new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(end)
    : "";
  return `User’s preferred availability: ${date}, ${startTime}${endTime ? `–${endTime}` : ""}`;
}

export default function ProposeSessionModal({ enquiry, practitionerProfile, onClose, onSuccess }) {
  const browserTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    []
  );

  const [form, setForm] = useState({
    durationMinutes:
      String(
        practitionerProfile
          ?.sessionDurationMinutes ||
        20
      ),

    sessionFee:
      practitionerProfile
        ?.sessionPrice != null
        ? String(
          practitionerProfile
            .sessionPrice
        )
        : "",

    sessionDate: "",
    startTime: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  const currency = practitionerProfile?.currency || "INR";

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.sessionDate || !form.startTime) {
      setError("Please select a session date and start time.");
      return;
    }

    const numericFee =
      Number(form.sessionFee);

    if (
      form.sessionFee === "" ||
      !Number.isFinite(numericFee) ||
      numericFee < 0
    ) {
      setError(
        "Please enter a valid session fee."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const localStart = new Date(`${form.sessionDate}T${form.startTime}:00`);
      if (Number.isNaN(localStart.getTime())) {
        setError("Please choose a valid date and time.");
        return;
      }

      await proposePractitionerSessionTime(
        enquiry.id,
        {
          proposedStart:
            localStart.toISOString(),

          durationMinutes:
            Number(
              form.durationMinutes
            ),

          timeZone:
            enquiry?.timeZone ||
            browserTimeZone,

          sessionType:
            "VIDEO",

          sessionFee:
            numericFee,

          currency,

          message:
            form.message.trim() ||
            undefined,
        }
      );

      onSuccess?.();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to send proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pr-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <form className="pr-modal pr-propose-modal" onSubmit={handleSubmit}>
        <div className="pr-modal-head">
          <div>
            <h2>Propose a session</h2>
            <p>{formatAvailability(enquiry)}</p>
          </div>
          <button type="button" className="pr-close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <label className="pr-field">
          <span>Service</span>
          <select value={enquiry?.supportTopic || "Counselling session"} disabled>
            <option>{enquiry?.supportTopic || "Counselling session"}</option>
          </select>
        </label>

        <div className="pr-form-two">
          <label className="pr-field">
            <span>Duration (minutes)</span>
            <select value={form.durationMinutes} onChange={(event) => update("durationMinutes", event.target.value)}>
              <option value="20">20 minutes</option>
              <option value="40">40 minutes</option>
            </select>
          </label>

          <label className="pr-field">
            <span>Session fee</span>
            <div className="pr-fee-input-wrap">
              <span className="pr-fee-prefix">
                {currency === "INR"
                  ? "₹"
                  : currency}
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.sessionFee}
                onChange={(event) =>
                  update(
                    "sessionFee",
                    event.target.value
                  )
                }
                placeholder="e.g. 500"
                required
              />
            </div>
          </label>
        </div>

        <div className="pr-section-title">Session schedule</div>
        <div className="pr-form-two">
          <label className="pr-field">
            <span>Session date</span>
            <MarketplaceDatePicker
              value={form.sessionDate}
              onChange={(value) => update("sessionDate", value)}
              placeholder="mm/dd/yyyy"
              minDate={todayValue()}
            />
          </label>

          <label className="pr-field">
            <span>Start time</span>
            <TimeDropdown
              value={form.startTime}
              onChange={(value) =>
                update(
                  "startTime",
                  value
                )
              }
              placeholder="Select start time"
              required
            />
          </label>
        </div>

        <label className="pr-field">
          <span>Anything you’d like to share? (Optional)</span>
          <textarea
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder="Message to the user (optional)"
          />
        </label>

        {error && <div className="pr-form-error">{error}</div>}

        <div className="pr-modal-footer">
          <small>The user will need to confirm your proposal</small>
          <div>
            <button type="button" className="pr-outline-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="pr-primary-button" disabled={submitting}>
              {submitting ? "Sending..." : "Send proposal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
