import { useNavigate } from "react-router-dom";
import MarketplaceIcon from "../marketplace/MarketplaceIcon";
import PractitionerAvatar from "./PractitionerAvatar";

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatCurrency(value, currency = "INR") {
  if (value === null || value === undefined || value === "") return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${currency} ${value}`;
  }
}

export default function PractitionerSessionCard({
  appointment,
  compact = false
}) {
  const navigate = useNavigate();
  const name = appointment?.user?.fullName || "User";

  return (
    <article className={`pr-upcoming-card ${compact ? "compact" : ""}`}>
      <div className="pr-upcoming-person">
        {!compact && <h3>Upcoming Session</h3>}
        <div className="pr-person-line">
          <PractitionerAvatar name={name} />
          <strong>{name}</strong>
        </div>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="date" /><span>Date</span></div>
        <strong>{formatDate(appointment?.scheduledStart)}</strong>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="time" /><span>Time</span></div>
        <strong>{formatTime(appointment?.scheduledStart)}</strong>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="payment" /><span>Fees</span></div>
        <strong>
  {formatCurrency(
    appointment?.sessionFee,
    appointment?.currency ||
      "INR"
  )}
</strong>
      </div>

      <div className="pr-upcoming-actions">
        <span className="pr-scheduled-pill">Scheduled</span>
        <div>
          <button
            type="button"
            className="pr-link-button"
            onClick={() => navigate(`/marketplace/practitioner/enquiries/${appointment?.enquiry?.id || appointment?.enquiryId}`)}
          >
            Reschedule
          </button>
          <button
            type="button"
            className="pr-primary-button"
            onClick={() => navigate(`/marketplace/appointments/${appointment.id}/join`)}
          >
            <MarketplaceIcon name="video" /> Join call
          </button>
        </div>
      </div>
    </article>
  );
}
