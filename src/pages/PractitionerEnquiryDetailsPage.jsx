import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  declinePractitionerEnquiry,
  getPractitionerEnquiryById,
  getPractitionerProfile,
} from "../api/practitionerMarketplaceApi";
import PractitionerAvatar from "../components/practitioner/PractitionerAvatar";
import ProposeSessionModal from "../components/practitioner/ProposeSessionModal";
import PractitionerRescheduleModal from "../components/practitioner/PractitionerRescheduleModal";
import "../styles/practitioner-marketplace.css";

function datePart(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function timePart(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function received(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PractitionerEnquiryDetailsPage() {
  const { enquiryId } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showProposal, setShowProposal] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [enquiryData, profileData] = await Promise.all([
        getPractitionerEnquiryById(enquiryId),
        getPractitionerProfile(),
      ]);
      setEnquiry(enquiryData?.enquiry || null);
      setProfile(profileData?.practitioner || null);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to load enquiry details.");
    } finally {
      setLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => { load(); }, [load]);

  const pendingUserProposal = useMemo(
    () => enquiry?.proposals?.find((proposal) => proposal.status === "PENDING" && proposal.proposedBy === "USER"),
    [enquiry]
  );

  useEffect(() => {
    if (enquiry?.status === "RESCHEDULE_REQUESTED" && pendingUserProposal) setShowReschedule(true);
  }, [enquiry?.status, pendingUserProposal]);

  const decline = async () => {
    if (!window.confirm("Decline this enquiry?")) return;
    try {
      setProcessing(true);
      setError("");
      await declinePractitionerEnquiry(enquiry.id, { reason: "Declined by practitioner" });
      navigate("/marketplace/practitioner/sessions?tab=new", { replace: true });
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to decline enquiry.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="pr-page"><div className="pr-loading">Loading enquiry...</div></div>;

  if (!enquiry) {
    return <div className="pr-page"><div className="pr-error-banner">{error || "Enquiry not found."}</div></div>;
  }

  const name = enquiry?.user?.fullName || "User";

  return (
    <div className="pr-page">
      <div className="pr-page-inner">
        <header className="pr-page-heading">
          <h1>Enquire Details</h1>
          <p>Review the request before proposing a call time</p>
        </header>

        {error && <div className="pr-error-banner">{error}</div>}

        <article className="pr-enquiry-detail-card">
          <div className="pr-detail-person">
            <PractitionerAvatar name={name} size="lg" />
            <div>
              <h2>{name}</h2>
              <p>Received {received(enquiry.createdAt)}</p>
            </div>
          </div>

          <div className="pr-detail-divider" />

          <div className="pr-detail-message">
            <strong>Enquiry Message</strong>
            <p>{enquiry.message || "No message was included."}</p>
          </div>

          <div className="pr-detail-grid">
            <div><strong>Requested Service</strong><span>{enquiry.supportTopic || "—"}</span></div>
            <div><strong>Preferred Date</strong><span>{datePart(enquiry.requestedStart)}</span></div>
            <div><strong>Available From</strong><span>{timePart(enquiry.requestedStart)}</span></div>
            <div><strong>Available To</strong><span>{timePart(enquiry.requestedEnd)}</span></div>
            <div><strong>Timezone</strong><span>{enquiry.timeZone || "—"}</span></div>
            <div><strong>Language Preference</strong><span>{enquiry.preferredLanguage || "—"}</span></div>
          </div>

          <div className="pr-detail-actions">
            {enquiry.status === "PENDING" && (
              <>
                <button type="button" className="pr-outline-button" disabled={processing} onClick={decline}>Decline enquiry</button>
                <button type="button" className="pr-primary-button" onClick={() => setShowProposal(true)}>Propose a time</button>
              </>
            )}

            {enquiry.status === "RESCHEDULE_REQUESTED" && (
              <button type="button" className="pr-primary-button" onClick={() => setShowReschedule(true)}>Review reschedule request</button>
            )}

            {enquiry.status === "TIME_PROPOSED" && <span className="pr-detail-state">Waiting for the user to confirm your proposal.</span>}

            {enquiry.status === "CONFIRMED" && enquiry.appointment && (
              <button type="button" className="pr-primary-button" onClick={() => navigate(`/marketplace/appointments/${enquiry.appointment.id}/join`)}>Join call</button>
            )}
          </div>
        </article>
      </div>

      {showProposal && (
        <ProposeSessionModal
          enquiry={enquiry}
          practitionerProfile={profile}
          onClose={() => setShowProposal(false)}
          onSuccess={async () => { setShowProposal(false); await load(); }}
        />
      )}

      {showReschedule && (
        <PractitionerRescheduleModal
          enquiry={enquiry}
          onClose={() => setShowReschedule(false)}
          onSuccess={async () => { setShowReschedule(false); await load(); navigate("/marketplace/practitioner/sessions?tab=upcoming"); }}
        />
      )}
    </div>
  );
}
