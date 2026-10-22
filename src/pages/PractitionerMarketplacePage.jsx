import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPractitionerAppointments,
  getPractitionerEnquiries,
  getPractitionerProfile,
} from "../api/practitionerMarketplaceApi";
import MarketplaceIcon from "../components/marketplace/MarketplaceIcon";
import PractitionerSessionCard from "../components/practitioner/PractitionerSessionCard";
import "../styles/marketplace.css";
import "../styles/practitioner-marketplace.css";

const CATEGORIES = ["All", "Mental Health", "Counselling", "Physical Wellness", "Nutrition", "Yoga & Mindfulness"];

function OwnProfileCard({ practitioner }) {
  const name = practitioner?.user?.fullName || "Practitioner";
  const specialties = (practitioner?.specialties || [])
    .map((item) => item?.specialty?.name || item?.name)
    .filter(Boolean)
    .slice(0, 3);
  const price = practitioner?.sessionPrice != null
    ? `₹${Number(practitioner.sessionPrice).toLocaleString("en-IN")} / session`
    : "Contact for fee";

  return (
    <article className="mk-practitioner-card pr-own-profile-card">
      <div className="mk-card-head">
        <div className="mk-avatar-lg">
          {practitioner?.profileImageUrl ? <img src={practitioner.profileImageUrl} alt={name} /> : name[0]}
        </div>
        <div className="mk-card-identity">
          <h2>{name}</h2>
          <p>{practitioner?.professionalTitle || practitioner?.practitionerType || "Practitioner"}</p>
          <div className="mk-rating"><span className="mk-stars">★★★★★</span><span className="mk-rating-value">4.5</span></div>
        </div>
      </div>

      <div className="mk-card-meta">
        <div className="mk-card-meta-item">
          <MarketplaceIcon name="location" />
          <span>Location: <strong>{practitioner?.user?.homeCountry || "—"}</strong></span>
        </div>
        <div className="mk-card-meta-item">
          <MarketplaceIcon name="speak" />
          <span>Speaks: <strong>{(practitioner?.languages || []).join(", ") || "—"}</strong></span>
        </div>
      </div>

      <div className="mk-expertise">
        <div className="mk-expertise-label"><MarketplaceIcon name="expertise" /><span>Expertise:</span></div>
        <div className="mk-specialty-row">
          {specialties.length
            ? specialties.map((item, index) => <span className={`mk-tag mk-tag-${index + 1}`} key={item}>{item}</span>)
            : <span className="mk-tag mk-tag-1">General wellbeing</span>}
        </div>
      </div>

      <div className="mk-card-footer">
        <strong>{price}</strong>
        <span className="pr-profile-preview-label">Your public profile</span>
      </div>
    </article>
  );
}

export default function PractitionerMarketplacePage({ initialProfile = null }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [enquiries, setEnquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const [profileData, enquiryData, appointmentData] = await Promise.all([
          initialProfile ? Promise.resolve({ practitioner: initialProfile }) : getPractitionerProfile(),
          getPractitionerEnquiries(),
          getPractitionerAppointments(),
        ]);
        if (!alive) return;
        setProfile(profileData?.practitioner || null);
        setEnquiries(enquiryData?.enquiries || []);
        setAppointments(appointmentData?.appointments || []);
      } catch (err) {
        if (alive) setError(err?.data?.message || err?.message || "Unable to load practitioner marketplace.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [initialProfile]);

  const actionableCount = enquiries.filter((item) => ["PENDING", "RESCHEDULE_REQUESTED"].includes(item.status)).length;
  const upcoming = useMemo(
    () => appointments
      .filter((item) => item.status === "CONFIRMED")
      .sort((a, b) => new Date(a.scheduledStart) - new Date(b.scheduledStart))[0],
    [appointments]
  );

  return (
    <main className="marketplace-page pr-practitioner-marketplace">
      <header className="pr-marketplace-head">
        <div>
          <h1>Marketplace</h1>
          <p>Explore wellness stays and find practitioners who support your wellbeing</p>
        </div>
      </header>

      <div className="pr-marketplace-nav-row">
        <div className="pr-marketplace-tabs">
          <button type="button" className="active">Practitioners</button>
          <button type="button" disabled>Resorts &amp; Retreats</button>
        </div>
        <button type="button" className="pr-primary-button pr-view-enquiries" onClick={() => navigate("/marketplace/practitioner/sessions?tab=new")}>
          View Enquiries {actionableCount ? `(${actionableCount})` : ""}
        </button>
      </div>

      <div className="mk-filter-row pr-practitioner-filter-row">
        <div className="mk-category-tabs">
          {CATEGORIES.map((item) => (
            <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
        <div className="mk-select-filters">
          <div className="mk-select-wrap"><select disabled><option>Language</option></select></div>
          <div className="mk-select-wrap"><select disabled><option>Location</option></select></div>
        </div>
      </div>

      {error && <div className="mk-error-banner">{error}</div>}
      {loading ? (
        <div className="mk-loading">Loading marketplace...</div>
      ) : (
        <>
          {upcoming && (
            <div className="pr-marketplace-upcoming">
              <PractitionerSessionCard appointment={upcoming} fee={profile?.sessionPrice} />
            </div>
          )}

          <div className="mk-practitioner-grid pr-own-profile-grid">
            {profile && <OwnProfileCard practitioner={profile} />}
          </div>
        </>
      )}
    </main>
  );
}
