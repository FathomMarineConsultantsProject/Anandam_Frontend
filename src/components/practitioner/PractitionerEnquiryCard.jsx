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

export default function PractitionerEnquiryCard({ enquiry, mode = "new" }) {
  const navigate = useNavigate();
  const name = enquiry?.user?.fullName || "User";
  const appointment = enquiry?.appointment;
  const activeUserProposal = enquiry?.proposals?.find(
    (proposal) => proposal.status === "PENDING" && proposal.proposedBy === "USER"
  );

  const displayStart =
    mode === "reschedule"
      ? activeUserProposal?.proposedStart || appointment?.scheduledStart || enquiry?.requestedStart
      : enquiry?.requestedStart;

  return (
    <article className={`pr-enquiry-row ${mode === "reschedule" ? "pr-reschedule-row" : ""}`}>
      <div className="pr-enquiry-main">
        <h3>{mode === "reschedule" ? "Reschedule Request" : "New Enquiry"}</h3>
        <div className="pr-person-line">
          <PractitionerAvatar name={name} />
          <strong>{name}</strong>
        </div>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="date" /><span>Date</span></div>
        <strong>{formatDate(displayStart)}</strong>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="time" /><span>Time</span></div>
        <strong>{formatTime(displayStart)}</strong>
      </div>

      <div className="pr-row-info">
        <div className="pr-row-label"><MarketplaceIcon name="language" /><span>Language</span></div>
        <strong>{enquiry?.preferredLanguage || "—"}</strong>
      </div>

      <div className="pr-row-action">
        {mode === "reschedule" && <span className="pr-reschedule-pill">Reschedule request</span>}
        <button
          type="button"
          className="pr-outline-button"
          onClick={() => navigate(`/marketplace/practitioner/enquiries/${enquiry.id}`)}
        >
          {mode === "reschedule" ? "Review reschedule request" : "Review enquiry"}
        </button>
      </div>
    </article>
  );
}
