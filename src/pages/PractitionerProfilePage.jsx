import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPractitionerBySlug } from "../api/marketplaceApi";
import "../styles/marketplace.css";

export default function PractitionerProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPractitionerBySlug(slug)
      .then((data) => active && setPractitioner(data.practitioner))
      .catch((err) => active && setError(err?.message || "Unable to load practitioner."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  if (loading) return <div className="mk-loading">Loading profile…</div>;
  if (!practitioner) return <div className="mk-loading">{error || "Practitioner not found."}</div>;

  const name = practitioner.user?.fullName || "Practitioner";
  const specialties = (practitioner.specialties || []).map((item) => item.specialty?.name || item.name).filter(Boolean);
  const location = practitioner.location || practitioner.country || practitioner.user?.homeCountry || "—";
  const qualifications = Array.isArray(practitioner.qualifications) ? practitioner.qualifications : practitioner.qualificationSummary ? [practitioner.qualificationSummary] : [];

  return (
    <main className="marketplace-page mk-profile-page">
      <button
  type="button"
  className="mk-page-back-button"
  onClick={() =>
    navigate(-1)
  }
>
  <span aria-hidden="true">
    ←
  </span>

  Back
</button>
      <div className="mk-profile-shell">
        <section className="mk-profile-content">
          <div className="mk-profile-head">
            <div className="mk-profile-avatar">{practitioner.profileImageUrl ? <img src={practitioner.profileImageUrl} alt={name} /> : name[0]}</div>
            <div><h1>{name}</h1><p>{practitioner.professionalTitle || practitioner.practitionerType}</p><div className="mk-rating"><span className="mk-stars">★★★★★</span><span className="mk-rating-value">4.5</span></div></div>
          </div>
          <ProfileSection title="About"><p>{practitioner.about || practitioner.shortBio || "A warm, practical approach to supporting your wellbeing."}</p></ProfileSection>
          <ProfileSection title="Session details"><div className="mk-session-detail-panel"><div><span>Session type</span><strong>{practitioner.sessionType || "Individual counselling"}</strong></div><div><span>Duration</span><strong>{practitioner.sessionDurationMinutes || 50} minutes</strong></div><div><span>Session fee</span><strong>{practitioner.sessionPrice != null ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")} / session` : "—"}</strong></div></div></ProfileSection>
          <ProfileSection title="Specialities"><div className="mk-specialty-row">{specialties.map((item, index) => <span className={`mk-tag mk-tag-${(index % 3) + 1}`} key={item}>{item}</span>)}</div></ProfileSection>
          <ProfileSection title="Qualifications"><div className="mk-bullet-row">{qualifications.length ? qualifications.map((item) => <span key={item}>–&nbsp; {item}</span>) : <span>–&nbsp; Professional qualifications verified</span>}</div></ProfileSection>
          <ProfileSection title="Professional experience"><div className="mk-bullet-row"><span>–&nbsp; {practitioner.experienceYears || 0} years of professional experience</span></div></ProfileSection>
          <ProfileSection title="Languages"><div className="mk-bullet-row"><span>–&nbsp; {(practitioner.languages || []).join(", ") || "—"}</span></div></ProfileSection>
          <ProfileSection title="Location"><div className="mk-bullet-row"><span>–&nbsp; {location}</span></div></ProfileSection>
        </section>

        <aside className="mk-enquire-card"><h3>Enquire with {name}.</h3><p>Tell us what you need support with and when you’re available for a session.</p><button className="mk-primary-button mk-full-button" onClick={() => navigate(`/marketplace/practitioners/${slug}/enquire`)}>Send Enquiry</button><small>Sending an enquiry does not confirm a booking.</small></aside>
      </div>
    </main>
  );
}

function ProfileSection({ title, children }) {
  return <section className="mk-profile-section"><h2>{title}</h2>{children}</section>;
}
