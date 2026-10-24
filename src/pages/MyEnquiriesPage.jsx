import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getMyAppointments,
  getMyEnquiries,
} from "../api/marketplaceApi";

import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import SessionCard from "../components/marketplace/SessionCard";

import "../styles/marketplace.css";

const TABS = [
  {
    id: "enquiries",
    label: "Enquiries",
  },
  {
    id: "upcoming",
    label: "Upcoming sessions",
  },
  {
    id: "history",
    label: "History",
  },
];

export default function MyEnquiriesPage() {
  const navigate =
    useNavigate();

  const [
    enquiries,
    setEnquiries,
  ] =
    useState([]);

  const [
    appointments,
    setAppointments,
  ] =
    useState([]);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState(
      "enquiries"
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [
        enquiryData,
        appointmentData,
      ] =
        await Promise.all([
          getMyEnquiries(),
          getMyAppointments(),
        ]);

      setEnquiries(
        enquiryData
          ?.enquiries ||
        []
      );

      setAppointments(
        appointmentData
          ?.appointments ||
        []
      );
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to load your marketplace activity."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const buckets =
    useMemo(
      () => {
        const activeEnquiries =
          enquiries.filter(
            (
              enquiry
            ) => {
              const appointmentStatus =
                enquiry
                  ?.appointment
                  ?.status;

              const appointmentEnded =
                [
                  "COMPLETED",
                  "CANCELLED",
                  "NO_SHOW",
                ].includes(
                  appointmentStatus
                );

              if (
                appointmentEnded
              ) {
                return false;
              }

              return [
                "PENDING",
                "TIME_PROPOSED",
                "RESCHEDULE_REQUESTED",
              ].includes(
                enquiry.status
              );
            }
          );

        const upcoming =
          appointments
            .filter(
              (
                appointment
              ) =>
                appointment.status ===
                "CONFIRMED"
            )
            .sort(
              (
                first,
                second
              ) =>
                new Date(
                  first.scheduledStart
                ) -
                new Date(
                  second.scheduledStart
                )
            );

        const history =
          appointments
            .filter(
              (
                appointment
              ) =>
                [
                  "COMPLETED",
                  "CANCELLED",
                  "NO_SHOW",
                ].includes(
                  appointment.status
                )
            )
            .sort(
              (
                first,
                second
              ) =>
                new Date(
                  second.scheduledStart
                ) -
                new Date(
                  first.scheduledStart
                )
            );

        return {
          activeEnquiries,
          upcoming,
          history,
        };
      },
      [
        enquiries,
        appointments,
      ]
    );

  return (
    <main className="marketplace-page">

      <header className="mk-page-heading">
        <div>
          <h1>
            My sessions
          </h1>

          <p>
            Manage your enquiries,
            upcoming sessions and
            previous appointments.
          </p>
        </div>

        <button
          type="button"
          className="mk-outline-button"
          onClick={() =>
            navigate(
              "/marketplace"
            )
          }
        >
          Browse practitioners
        </button>
      </header>

      <div className="mk-user-session-tabs">
        {TABS.map(
          (
            tab
          ) => {
            let count = 0;

            if (
              tab.id ===
              "enquiries"
            ) {
              count =
                buckets
                  .activeEnquiries
                  .length;
            }

            if (
              tab.id ===
              "upcoming"
            ) {
              count =
                buckets
                  .upcoming
                  .length;
            }

            if (
              tab.id ===
              "history"
            ) {
              count =
                buckets
                  .history
                  .length;
            }

            return (
              <button
                key={
                  tab.id
                }
                type="button"
                className={
                  activeTab ===
                  tab.id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                {tab.label}

                {count > 0 &&
                  ` (${count})`}
              </button>
            );
          }
        )}
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
        <>
          {activeTab ===
            "enquiries" && (
            <section className="mk-enquiry-list">
              {buckets
                .activeEnquiries
                .map(
                  (
                    enquiry
                  ) => (
                    <EnquiryStatusCard
                      key={
                        enquiry.id
                      }
                      enquiry={
                        enquiry
                      }
                      onOpen={() =>
                        navigate(
                          `/marketplace/enquiries/${enquiry.id}`
                        )
                      }
                    />
                  )
                )}

              {!buckets
                .activeEnquiries
                .length && (
                <EmptyState
                  title="No active enquiries"
                  body="New enquiries and practitioner responses will appear here."
                />
              )}
            </section>
          )}

          {activeTab ===
            "upcoming" && (
            <section className="mk-session-list">
              {buckets
                .upcoming
                .map(
                  (
                    appointment
                  ) => (
                    <SessionCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                      onChanged={
                        load
                      }
                    />
                  )
                )}

              {!buckets
                .upcoming
                .length && (
                <EmptyState
                  title="No upcoming sessions"
                  body="Confirmed appointments will appear here."
                />
              )}
            </section>
          )}

          {activeTab ===
            "history" && (
            <section className="mk-session-list">
              {buckets
                .history
                .map(
                  (
                    appointment
                  ) => (
                    <SessionCard
                      key={
                        appointment.id
                      }
                      appointment={
                        appointment
                      }
                      onChanged={
                        load
                      }
                    />
                  )
                )}

              {!buckets
                .history
                .length && (
                <EmptyState
                  title="No session history"
                  body="Completed, cancelled and missed sessions will appear here."
                />
              )}
            </section>
          )}
        </>
      )}

    </main>
  );
}

function EmptyState({
  title,
  body,
}) {
  return (
    <div className="mk-user-empty-state">
      <h3>
        {title}
      </h3>

      <p>
        {body}
      </p>
    </div>
  );
}