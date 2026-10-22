import { useEffect, useState } from "react";
import { getMyAppointments } from "../api/marketplaceApi";
import SessionCard from "../components/marketplace/SessionCard";
import "../styles/marketplace.css";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await getMyAppointments();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err?.message || "Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading"><div><h1>My sessions</h1><p>Upcoming and completed appointments with your practitioners</p></div></header>
      {error && <div className="mk-error-banner">{error}</div>}
      {loading ? <div className="mk-loading">Loading sessions…</div> : <div className="mk-session-list">{appointments.map((appointment) => <SessionCard key={appointment.id} appointment={appointment} onChanged={load} />)}{!appointments.length && <div className="mk-empty-state">You do not have any booked sessions yet.</div>}</div>}
    </main>
  );
}
