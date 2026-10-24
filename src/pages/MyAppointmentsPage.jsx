import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMyAppointments,
} from "../api/marketplaceApi";

import SessionCard from "../components/marketplace/SessionCard";

import "../styles/marketplace.css";

const HISTORY_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("upcoming");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyAppointments();

        setAppointments(
          data?.appointments || []
        );
      } catch (err) {
        setError(
          err?.data?.message ||
            err?.message ||
            "Unable to load sessions."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    load();
  }, []);

  const upcoming =
    useMemo(
      () =>
        appointments
          .filter(
            (appointment) =>
              appointment.status ===
              "CONFIRMED"
          )
          .sort(
            (a, b) =>
              new Date(
                a.scheduledStart
              ) -
              new Date(
                b.scheduledStart
              )
          ),
      [appointments]
    );

  const history =
    useMemo(
      () =>
        appointments
          .filter(
            (appointment) =>
              HISTORY_STATUSES.includes(
                appointment.status
              )
          )
          .sort(
            (a, b) =>
              new Date(
                b.scheduledStart
              ) -
              new Date(
                a.scheduledStart
              )
          ),
      [appointments]
    );

  const visibleAppointments =
    activeTab === "upcoming"
      ? upcoming
      : history;

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading">
        <div>
          <h1>My sessions</h1>

          <p>
            Manage your upcoming and
            previous practitioner sessions
          </p>
        </div>
      </header>

      <div className="mk-session-tabs">
        <button
          type="button"
          className={
            activeTab === "upcoming"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "upcoming"
            )
          }
        >
          Upcoming
          {upcoming.length > 0 &&
            ` (${upcoming.length})`}
        </button>

        <button
          type="button"
          className={
            activeTab === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "history"
            )
          }
        >
          History
          {history.length > 0 &&
            ` (${history.length})`}
        </button>
      </div>

      {error && (
        <div className="mk-error-banner">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mk-loading">
          Loading sessions…
        </div>
      ) : (
        <div className="mk-session-list">
          {visibleAppointments.map(
            (appointment) => (
              <SessionCard
                key={appointment.id}
                appointment={appointment}
                onChanged={load}
              />
            )
          )}

          {!visibleAppointments.length && (
            <div className="mk-empty-state">
              {activeTab ===
              "upcoming"
                ? "You do not have any upcoming sessions."
                : "Your completed sessions will appear here."}
            </div>
          )}
        </div>
      )}
    </main>
  );
}