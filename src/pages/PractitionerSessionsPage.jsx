import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getPractitionerAppointments,
  getPractitionerEnquiries,
  getPractitionerProfile,
} from "../api/practitionerMarketplaceApi";
import PractitionerStats from "../components/practitioner/PractitionerStats";
import PractitionerTabs from "../components/practitioner/PractitionerTabs";
import PractitionerEnquiryCard from "../components/practitioner/PractitionerEnquiryCard";
import PractitionerSessionCard from "../components/practitioner/PractitionerSessionCard";
import PractitionerHistoryTable from "../components/practitioner/PractitionerHistoryTable";
import "../styles/practitioner-marketplace.css";

function EmptyState({ tab }) {
  const content = {
    new: ["No Enquiries Yet", "New enquiries will appear here when someone contacts you"],
    upcoming: ["No Upcoming Sessions", "Confirmed appointments will appear here."],
    reschedule: ["No Reschedule Requests", "Requests to change a confirmed session will appear here."],
  };
  const [title, body] = content[tab] || content.new;

  return (
    <div className="pr-empty-card">
      <div className="pr-empty-illustration" aria-hidden="true">
        <div className="pr-empty-paper">×</div>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export default function PractitionerSessionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = new URLSearchParams(location.search).get("tab") || "new";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [profileData, enquiryData, appointmentData] = await Promise.all([
        getPractitionerProfile(),
        getPractitionerEnquiries(),
        getPractitionerAppointments(),
      ]);
      setProfile(profileData?.practitioner || null);
      setEnquiries(enquiryData?.enquiries || []);
      setAppointments(appointmentData?.appointments || []);
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to load your sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const next = new URLSearchParams(location.search).get("tab");
    if (next && ["new", "upcoming", "reschedule", "history"].includes(next)) {
      setActiveTab(next);
    }
  }, [location.search]);

  const buckets = useMemo(() => {
    const pending = enquiries.filter((item) => item.status === "PENDING");
    const reschedule = enquiries.filter((item) => item.status === "RESCHEDULE_REQUESTED");
    const upcoming = appointments.filter((item) => item.status === "CONFIRMED");
    const history = appointments
      .filter((item) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(item.status))
      .sort((a, b) => new Date(b.scheduledStart) - new Date(a.scheduledStart));

    return { pending, reschedule, upcoming, history };
  }, [enquiries, appointments]);

  const counts = {
    new: buckets.pending.length,
    awaiting: buckets.reschedule.length,
    upcoming: buckets.upcoming.length,
    reschedule: buckets.reschedule.length,
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    navigate(`/marketplace/practitioner/sessions?tab=${tab}`, { replace: true });
  };

  return (
    <div className="pr-page">
      <div className="pr-page-inner">
        <header className="pr-page-heading">
          <h1>My sessions</h1>
          <p>Manage your enquiries, appointments and reschedule requests.</p>
        </header>

        <PractitionerStats counts={counts} />
        <PractitionerTabs active={activeTab} counts={counts} onChange={changeTab} />

        {error && <div className="pr-error-banner">{error}</div>}

        {loading ? (
          <div className="pr-loading">Loading sessions...</div>
        ) : (
          <section className="pr-tab-content">
            {activeTab === "new" && (
              buckets.pending.length
                ? buckets.pending.map((enquiry) => <PractitionerEnquiryCard key={enquiry.id} enquiry={enquiry} />)
                : <EmptyState tab="new" />
            )}

            {activeTab === "upcoming" && (
              buckets.upcoming.length
                ? <div className="pr-session-stack">{buckets.upcoming.map((appointment) => (
                  <PractitionerSessionCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}</div>
                : <EmptyState tab="upcoming" />
            )}

            {activeTab === "reschedule" && (
              buckets.reschedule.length
                ? buckets.reschedule.map((enquiry) => <PractitionerEnquiryCard key={enquiry.id} enquiry={enquiry} mode="reschedule" />)
                : <EmptyState tab="reschedule" />
            )}

            {activeTab === "history" && <PractitionerHistoryTable appointments={buckets.history} />}
          </section>
        )}
      </div>
    </div>
  );
}
