import { useMemo } from "react";
import MarketplaceIcon from "./MarketplaceIcon";

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export default function EnquiryStatusCard({ enquiry, onOpen, onConfirm, onAskNewTime, confirming = false }) {
  const pendingProposal = useMemo(
    () => enquiry?.proposals?.find((proposal) => proposal.status === "PENDING" && proposal.proposedBy === "PRACTITIONER"),
    [enquiry]
  );
  const status = enquiry?.status;
  const practitioner = enquiry?.practitioner;
  const person = practitioner?.user?.fullName || "Practitioner";

  if (status === "TIME_PROPOSED" && pendingProposal) {
    return (
      <section className="mk-status-card mk-proposal-status-card">
        <div className="mk-status-person-block">
          <h2>Call Time Proposed</h2>
          <div className="mk-person-mini">
            <Avatar practitioner={practitioner} />
            <div><strong>{person}</strong><span>{practitioner?.professionalTitle || "Practitioner"}</span></div>
          </div>
        </div>
        <Info icon="date" label="Date" value={formatDate(pendingProposal.proposedStart)} />
        <Info icon="time" label="Time" value={formatTime(pendingProposal.proposedStart)} />
        <Info icon="payment" label="Fees" value={practitioner?.sessionPrice ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")}` : "—"} />
        <div className="mk-status-actions">
          <span className="mk-pill mk-pill-warn">Awaiting your confirmation</span>
          <div className="mk-status-action-row">
            <button className="mk-link-button" onClick={() => onAskNewTime?.(pendingProposal)}>Ask for new time</button>
            <button className="mk-primary-button" onClick={() => onConfirm?.(pendingProposal)} disabled={confirming}>{confirming ? "Confirming..." : "Confirm Session"}</button>
          </div>
        </div>
      </section>
    );
  }

  if (status === "CONFIRMED" && enquiry?.appointment) {
    return (
      <section className="mk-status-card mk-booked-status-card">
        <div className="mk-status-person-block">
          <h2>Session Booked</h2>
          <div className="mk-person-mini">
            <Avatar practitioner={practitioner} />
            <div><strong>{person}</strong><span>{practitioner?.professionalTitle || "Practitioner"}</span></div>
          </div>
        </div>
        <Info icon="date" label="Date" value={formatDate(enquiry.appointment.scheduledStart)} />
        <Info icon="time" label="Time" value={formatTime(enquiry.appointment.scheduledStart)} />
        <Info icon="payment" label="Fees" value={practitioner?.sessionPrice ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")}` : "—"} />
        <div className="mk-status-actions">
          <span className="mk-pill mk-pill-ok">Scheduled</span>
          <div className="mk-status-action-row">
            <button className="mk-link-button" onClick={onOpen}>Reschedule</button>
            <button className="mk-primary-button" onClick={onOpen}><MarketplaceIcon name="video" className="mk-button-icon" />Join call</button>
          </div>
        </div>
      </section>
    );
  }

  const requested = enquiry?.requestedStart;
  const isDeclined = status === "DECLINED" || status === "CLOSED";
  return (
    <section className="mk-status-card mk-enquiry-sent-card">
      <div className="mk-status-main-copy">
        <h2>{isDeclined ? "Enquiry Declined" : "Enquiry Sent"}</h2>
        <div className="mk-request-grid">
          <Info icon="date" label="Preferred Date" value={formatDate(requested)} />
          <Info icon="time" label="Time" value={formatTime(requested)} />
          <Info icon="language" label="Language" value={enquiry?.preferredLanguage || "—"} />
        </div>
        <p>{isDeclined
          ? "The practitioner did not accept your session request."
          : status === "RESCHEDULE_REQUESTED"
            ? "Your new time request has been sent to the practitioner."
            : "Your enquiry has been sent to the practitioner. If accepted, they’ll suggest a time for your call for you to review and confirm."}
        </p>
      </div>
      <div className="mk-status-side">
        <span className={`mk-pill ${isDeclined ? "mk-pill-declined" : "mk-pill-pending"}`}>
          {isDeclined ? "Declined" : status === "RESCHEDULE_REQUESTED" ? "Reschedule Requested" : "Session Requested"}
        </span>
        <button className="mk-dots-button" onClick={onOpen} aria-label="Open enquiry"><MarketplaceIcon name="more" /></button>
      </div>
    </section>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="mk-info">
      <div className="mk-info-label"><MarketplaceIcon name={icon} /><span>{label}</span></div>
      <strong>{value}</strong>
    </div>
  );
}

function Avatar({ practitioner }) {
  const name = practitioner?.user?.fullName || "P";
  return <div className="mk-mini-avatar">{practitioner?.profileImageUrl ? <img src={practitioner.profileImageUrl} alt={name} /> : name[0]}</div>;
}
